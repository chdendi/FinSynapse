const assert = require('node:assert/strict');
const { test } = require('node:test');
const updateAlert = require('./daily-alert.cjs');

const MARKER = '<!-- finsynapse:daily:main -->';
const BOT = 'github-actions[bot]';
const repo = { owner: 'example', repo: 'FinSynapse' };

function issue(number, overrides = {}) {
  return {
    number,
    title: '[CI] Daily ingest/publish failing',
    body: MARKER,
    state: 'open',
    labels: [{ name: 'ci-failure' }, { name: 'auto' }],
    user: { login: BOT },
    ...overrides,
  };
}

function legacy(number) {
  return issue(number, {
    title: '[CI] Daily ingest failed 2026-06-01',
    body: `Daily workflow failed.\n\nRun: https://github.com/example/FinSynapse/actions/runs/${number}`,
  });
}

function fixture({ issues = [], comments = {}, newerRun = false, newerStatus = 'completed', fail = null } = {}) {
  const calls = [];
  const state = { issues: structuredClone(issues), comments: structuredClone(comments) };
  const run = { workflow_id: 12, run_number: 50, run_attempt: 1 };
  const context = { repo, ref: 'refs/heads/main', runId: 500, serverUrl: 'https://github.com' };
  function endpoint(name, fn) {
    return async args => {
      calls.push({ name, args });
      if (fail === name) throw new Error(`API failure: ${name}`);
      return { data: structuredClone(fn(args)) };
    };
  }
  function page(items, args) {
    const start = (args.page - 1) * args.per_page;
    return items.slice(start, start + args.per_page);
  }
  const github = {
    rest: {
      actions: {
        getWorkflowRun: endpoint('getWorkflowRun', () => run),
        listWorkflowRuns: endpoint('listWorkflowRuns', args => ({
          workflow_runs: newerRun && args.status !== newerStatus ? [] :
            [{ ...run, run_number: newerRun ? 51 : 50 }],
        })),
      },
      issues: {
        listForRepo: endpoint('listForRepo', args => page(state.issues.filter(x => x.state === 'open'), args)),
        listComments: endpoint('listComments', args => page(state.comments[args.issue_number] || [], args)),
        create: endpoint('create', args => {
          const created = issue(Math.max(0, ...state.issues.map(x => x.number)) + 1, args);
          state.issues.push(created);
          return created;
        }),
        update: endpoint('update', args => {
          const current = state.issues.find(x => x.number === args.issue_number);
          Object.assign(current, args);
          return current;
        }),
        createComment: endpoint('createComment', args => {
          const comment = { body: args.body, user: { login: BOT } };
          (state.comments[args.issue_number] ||= []).push(comment);
          return comment;
        }),
      },
    },
    async paginate(method, args) {
      const result = [];
      for (let page = 1; ; page++) {
        const { data } = await method({ ...args, page });
        result.push(...data);
        if (data.length < args.per_page) return result;
      }
    },
  };
  return {
    state, calls, run, context,
    execute: (result = 'failure', runAttempt = 1) => updateAlert({
      github, context, core: { info() {} }, result, runAttempt,
    }),
  };
}

function writes(f) {
  return f.calls.filter(call => ['create', 'update', 'createComment'].includes(call.name));
}

test('first failure opens one alert with an attempt link; repeating it does not duplicate', async () => {
  const f = fixture();
  await f.execute();
  await f.execute();
  assert.equal(f.state.issues.length, 1);
  assert.match(f.state.issues[0].body, /actions\/runs\/500\/attempts\/1/);
  assert.deepEqual(writes(f).map(call => call.name), ['create']);
});

test('consecutive failures and new attempts append to the existing incident', async () => {
  const f = fixture({ issues: [issue(7)] });
  await f.execute();
  await f.execute();
  f.context.runId = 501;
  f.run.run_number = 51;
  await f.execute();
  f.run.run_attempt = 2;
  await f.execute('failure', 2);
  assert.equal(f.state.issues.length, 1);
  assert.equal(f.state.comments[7].length, 3);
  assert.match(f.state.comments[7][2].body, /501:2:failure/);
});

test('success closes all owned current and legacy alerts, without creating an issue', async () => {
  const f = fixture({ issues: [issue(7), legacy(8)] });
  await f.execute('success');
  await f.execute('success');
  assert.ok(f.state.issues.every(x => x.state === 'closed' && x.state_reason === 'completed'));
  assert.ok(f.state.issues.every(x => f.state.comments[x.number].length === 1));
  assert.equal(f.calls.filter(call => call.name === 'create').length, 0);
  assert.match(f.state.comments[7][0].body, /Daily workflow recovered/);
});

test('success without an open incident performs no writes', async () => {
  const f = fixture();
  await f.execute('success');
  assert.deepEqual(writes(f), []);
});

test('a new failure after recovery creates a fresh incident', async () => {
  const f = fixture({ issues: [issue(7)] });
  await f.execute('success');
  f.context.runId = 501;
  f.run.run_number = 51;
  await f.execute('failure');
  assert.equal(f.state.issues[0].state, 'closed');
  assert.equal(f.state.issues[1].state, 'open');
});

test('legacy duplicates consolidate into the newest legacy issue and retain evidence', async () => {
  const f = fixture({ issues: [legacy(33), legacy(76)] });
  await f.execute();
  assert.equal(f.state.issues[0].state, 'closed');
  assert.equal(f.state.issues[0].state_reason, 'not_planned');
  assert.match(f.state.comments[33][0].body, /Consolidated into #76/);
  assert.equal(f.state.issues[1].state, 'open');
  assert.equal(f.state.issues[1].title, '[CI] Daily ingest/publish failing');
  assert.ok(f.state.issues[1].body.includes(MARKER));
  assert.match(f.state.issues[1].body, /actions\/runs\/76/);
  assert.equal(f.calls.filter(call => call.name === 'create').length, 0);
});

test('an existing marked incident takes priority over newer legacy issues', async () => {
  const f = fixture({ issues: [issue(7), legacy(76)] });
  await f.execute();
  assert.equal(f.state.issues[0].state, 'open');
  assert.equal(f.state.issues[1].state, 'closed');
  assert.match(f.state.comments[76][0].body, /Consolidated into #7/);
});

for (const result of ['success', 'failure']) {
  test(`${result} leaves human issues, PRs, and other automation untouched`, async () => {
    const unrelated = [
      issue(1, { user: { login: 'maintainer' } }),
      issue(2, { pull_request: { url: 'https://example.com/pr/2' } }),
      issue(3, { labels: [{ name: 'ci-failure' }] }),
      issue(4, { body: '<!-- other-workflow -->' }),
      legacy(5),
      issue(6, { user: null }),
    ];
    unrelated[4].body = 'Daily workflow failed.\nRun: https://github.com/another/repo/actions/runs/5';
    const f = fixture({ issues: unrelated });
    await f.execute(result);
    assert.deepEqual(f.state.issues.slice(0, unrelated.length), unrelated);
    assert.equal(writes(f).length, result === 'failure' ? 1 : 0);
  });

  test(`an old run cannot apply ${result} over a newer run`, async () => {
    const f = fixture({ issues: [issue(7)], newerRun: true });
    await f.execute(result);
    assert.deepEqual(writes(f), []);
  });

  test(`an old attempt cannot apply ${result} over a newer attempt`, async () => {
    const f = fixture({ issues: [issue(7)] });
    f.run.run_attempt = 2;
    await f.execute(result, 1);
    assert.deepEqual(writes(f), []);
  });

  for (const newerStatus of ['queued', 'in_progress']) {
    test(`a newer ${newerStatus} run does not suppress the current ${result}`, async () => {
      const f = fixture({ issues: [issue(7)], newerRun: true, newerStatus });
      await f.execute(result);
      assert.equal(f.state.comments[7].length, 1);
      assert.equal(f.state.issues[0].state, result === 'success' ? 'closed' : 'open');
    });
  }
}

for (const result of ['cancelled', 'skipped', '']) {
  test(`${result || 'missing result'} does not change alerts or call GitHub`, async () => {
    const f = fixture({ issues: [issue(7)] });
    await f.execute(result);
    assert.deepEqual(f.calls, []);
  });
}

test('a manual run on another branch does not call GitHub', async () => {
  const f = fixture({ issues: [issue(7)] });
  f.context.ref = 'refs/heads/feature';
  await f.execute();
  assert.deepEqual(f.calls, []);
});

test('issue and comment pagination find an incident and duplicate event past page one', async () => {
  const padding = Array.from({ length: 100 }, (_, i) => issue(i + 1, { user: { login: 'human' } }));
  const comments = Array.from({ length: 100 }, () => ({ body: 'investigating', user: { login: BOT } }));
  comments.push({ body: '<!-- finsynapse:daily:main:500:1:failure -->', user: { login: BOT } });
  const f = fixture({ issues: [...padding, issue(101)], comments: { 101: comments } });
  await f.execute();
  assert.deepEqual(writes(f), []);
  assert.ok(f.calls.some(call => call.name === 'listForRepo' && call.args.page === 2));
  assert.ok(f.calls.some(call => call.name === 'listComments' && call.args.page === 2));
});

for (const fail of ['getWorkflowRun', 'listWorkflowRuns', 'listForRepo', 'listComments']) {
  test(`${fail} error aborts instead of creating a duplicate or falsely resolving`, async () => {
    const f = fixture({ issues: [issue(7)], fail });
    await assert.rejects(f.execute(), /API failure/);
    assert.deepEqual(writes(f), []);
  });
}

test('recovery comment failure leaves the incident open for a retry', async () => {
  const f = fixture({ issues: [issue(7)], fail: 'createComment' });
  await assert.rejects(f.execute('success'), /API failure/);
  assert.equal(f.state.issues[0].state, 'open');
});

test('a forged event marker in a human comment cannot suppress a real failure', async () => {
  const f = fixture({
    issues: [issue(7)],
    comments: { 7: [{ body: '<!-- finsynapse:daily:main:500:1:failure -->', user: { login: 'human' } }] },
  });
  await f.execute();
  assert.equal(f.state.comments[7].length, 2);
});
