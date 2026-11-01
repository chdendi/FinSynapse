const assert = require('node:assert/strict');
const test = require('node:test');

const {
  TITLE_PREFIX,
  LABELS,
  isDailyFailureIssue,
  mergeIssues,
  failureComment,
  successComment,
  issueTitle,
  findOpenDailyFailures,
  handleFailure,
  handleSuccess,
} = require('./daily-ci-issue');

const NOW = new Date('2026-10-27T14:46:00.000Z');

function issue(number, title, createdAt, extra = {}) {
  return {
    number,
    title,
    created_at: createdAt,
    labels: [{ name: 'ci-failure' }, { name: 'auto' }],
    ...extra,
  };
}

function context() {
  return {
    repo: { owner: 'chdendi', repo: 'FinSynapse' },
    serverUrl: 'https://github.com',
    runId: 4242,
  };
}

function coreRecorder() {
  const warnings = [];
  const notices = [];
  return {
    warnings,
    notices,
    warning(message) {
      warnings.push(message);
    },
    notice(message) {
      notices.push(message);
    },
  };
}

function mockGithub({ labeled = [], searched = [], searchError = null, labelError = null } = {}) {
  const comments = [];
  const created = [];
  const updates = [];
  const github = {
    rest: {
      issues: {
        listForRepo: async () => ({}),
        createComment: async (args) => {
          comments.push(args);
          return { data: {} };
        },
        create: async (args) => {
          created.push(args);
          return { data: { number: 501 } };
        },
        update: async (args) => {
          updates.push(args);
          return { data: {} };
        },
      },
      search: {
        issuesAndPullRequests: async () => ({}),
      },
    },
  };
  github.paginate = async (fn) => {
    if (fn === github.rest.issues.listForRepo) {
      if (labelError) throw labelError;
      return labeled;
    }
    if (fn === github.rest.search.issuesAndPullRequests) {
      if (searchError) throw searchError;
      return searched;
    }
    throw new Error(`unexpected paginate target: ${fn && fn.name}`);
  };
  return { github, comments, created, updates };
}

test('title prefix identifies daily ingest failures and skips other ci-failure issues', () => {
  assert.equal(isDailyFailureIssue(issue(1, `${TITLE_PREFIX} 2026-06-25`, '2026-06-25T00:00:00Z')), true);
  assert.equal(isDailyFailureIssue(issue(2, '[CI] lint failed', '2026-06-25T00:00:00Z')), false);
  assert.equal(
    isDailyFailureIssue(issue(3, `${TITLE_PREFIX} 2026-06-25`, '2026-06-25T00:00:00Z', { pull_request: {} })),
    false,
  );
  assert.equal(isDailyFailureIssue({ number: 4, title: null }), false);
  assert.equal(isDailyFailureIssue(null), false);
});

test('mergeIssues dedupes, drops unrelated titles, and keeps the oldest first', () => {
  const oldest = issue(35, `${TITLE_PREFIX} 2026-06-01`, '2026-06-01T11:24:51Z');
  const newest = issue(76, `${TITLE_PREFIX} 2026-06-25`, '2026-06-25T10:33:50Z');
  const other = issue(9, '[CI] ci.yml failed', '2026-06-01T00:00:00Z');
  const merged = mergeIssues([newest, oldest, newest, other, { number: 10 }]);
  assert.deepEqual(merged.map((item) => item.number), [35, 76]);
});

test('findOpenDailyFailures unions label and title search results', async () => {
  const fromLabel = issue(35, `${TITLE_PREFIX} 2026-06-01`, '2026-06-01T11:24:51Z');
  const fromSearch = issue(80, `${TITLE_PREFIX} 2026-07-01`, '2026-07-01T00:00:00Z');
  const unrelated = issue(9, '[CI] codeql failed', '2026-06-02T00:00:00Z');
  const { github } = mockGithub({ labeled: [fromLabel, unrelated], searched: [fromSearch, fromLabel] });
  const core = coreRecorder();
  const found = await findOpenDailyFailures({ github, context: context(), core });
  assert.deepEqual(found.map((item) => item.number), [35, 80]);
  assert.deepEqual(core.warnings, []);
});

test('findOpenDailyFailures still returns label matches when title search fails', async () => {
  const fromLabel = issue(35, `${TITLE_PREFIX} 2026-06-01`, '2026-06-01T11:24:51Z');
  const { github } = mockGithub({
    labeled: [fromLabel],
    searchError: Object.assign(new Error('rate limited'), { status: 403 }),
  });
  const core = coreRecorder();
  const found = await findOpenDailyFailures({ github, context: context(), core });
  assert.deepEqual(found.map((item) => item.number), [35]);
  assert.equal(core.warnings.length, 1);
});

test('findOpenDailyFailures tolerates a missing ci-failure label', async () => {
  const fromSearch = issue(80, `${TITLE_PREFIX} 2026-07-01`, '2026-07-01T00:00:00Z');
  const { github } = mockGithub({
    labelError: Object.assign(new Error('Label does not exist'), { status: 404 }),
    searched: [fromSearch],
  });
  const core = coreRecorder();
  const found = await findOpenDailyFailures({ github, context: context(), core });
  assert.deepEqual(found.map((item) => item.number), [80]);
  assert.match(core.warnings[0], /ci-failure/);
});

test('failure comments on the oldest open issue and does not create another', async () => {
  const oldest = issue(35, `${TITLE_PREFIX} 2026-06-01`, '2026-06-01T11:24:51Z');
  const newer = issue(76, `${TITLE_PREFIX} 2026-06-25`, '2026-06-25T10:33:50Z');
  const { github, comments, created } = mockGithub({ labeled: [newer, oldest] });
  const core = coreRecorder();
  const result = await handleFailure({ github, context: context(), core, now: NOW });

  assert.deepEqual(result, { action: 'commented', issue: 35 });
  assert.equal(created.length, 0);
  assert.equal(comments.length, 1);
  assert.equal(comments[0].issue_number, 35);
  assert.match(comments[0].body, /2026-10-27T14:46:00.000Z/);
  assert.match(comments[0].body, /https:\/\/github.com\/chdendi\/FinSynapse\/actions\/runs\/4242/);
  assert.match(comments[0].body, /1 other open issue/);
});

test('failure does not create an issue when the open-issue lookup fails', async () => {
  const { github, created, comments } = mockGithub({
    labelError: Object.assign(new Error('server error'), { status: 500 }),
  });
  await assert.rejects(
    () => handleFailure({ github, context: context(), core: coreRecorder(), now: NOW }),
    /server error/,
  );
  assert.equal(created.length, 0);
  assert.equal(comments.length, 0);
});

test('failure creates one labeled issue when none are open', async () => {
  const { github, comments, created } = mockGithub();
  const core = coreRecorder();
  const result = await handleFailure({ github, context: context(), core, now: NOW });

  assert.deepEqual(result, { action: 'created', issue: 501 });
  assert.equal(comments.length, 0);
  assert.equal(created.length, 1);
  assert.equal(created[0].title, issueTitle(NOW.toISOString()));
  assert.equal(created[0].title, `${TITLE_PREFIX} 2026-10-27`);
  assert.deepEqual(created[0].labels, LABELS);
  assert.match(created[0].body, /actions\/runs\/4242/);
  assert.match(created[0].body, /2026-10-27T14:46:00.000Z/);
  assert.match(created[0].body, /AkShare upstream rename/);
});

test('success closes every open daily failure issue and leaves other issues alone', async () => {
  const oldest = issue(35, `${TITLE_PREFIX} 2026-06-01`, '2026-06-01T11:24:51Z');
  const newer = issue(76, `${TITLE_PREFIX} 2026-06-25`, '2026-06-25T10:33:50Z');
  const unrelated = issue(9, '[CI] ci.yml failed', '2026-05-01T00:00:00Z');
  const { github, comments, updates } = mockGithub({ labeled: [unrelated, newer, oldest] });
  const core = coreRecorder();
  const result = await handleSuccess({ github, context: context(), core, now: NOW });

  assert.deepEqual(result, { action: 'closed', closed: [35, 76] });
  assert.deepEqual(comments.map((comment) => comment.issue_number), [35, 76]);
  assert.deepEqual(
    updates.map((update) => ({
      issue_number: update.issue_number,
      state: update.state,
      state_reason: update.state_reason,
    })),
    [
      { issue_number: 35, state: 'closed', state_reason: 'completed' },
      { issue_number: 76, state: 'closed', state_reason: 'completed' },
    ],
  );
  for (const comment of comments) {
    assert.match(comment.body, /Daily ingest succeeded again at 2026-10-27T14:46:00.000Z/);
    assert.match(comment.body, /actions\/runs\/4242/);
  }
});

test('success is a no-op when nothing is open', async () => {
  const { github, comments, updates } = mockGithub();
  const core = coreRecorder();
  const result = await handleSuccess({ github, context: context(), core, now: NOW });
  assert.deepEqual(result, { action: 'none', closed: [] });
  assert.equal(comments.length, 0);
  assert.equal(updates.length, 0);
});

test('comment helpers include the run URL and timestamp', () => {
  const url = 'https://github.com/chdendi/FinSynapse/actions/runs/7';
  assert.ok(failureComment({ timestamp: NOW.toISOString(), runUrl: url, extraOpenCount: 0 }).includes(url));
  assert.match(successComment({ timestamp: NOW.toISOString(), runUrl: url }), /succeeded again/);
  assert.doesNotMatch(failureComment({ timestamp: NOW.toISOString(), runUrl: url, extraOpenCount: 0 }), /other open issue/);
});
