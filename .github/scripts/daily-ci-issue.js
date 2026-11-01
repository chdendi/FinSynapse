// Sync the single open "[CI] Daily ingest failed …" issue for daily.yml.
//
// Failure: comment on the oldest open match (run URL + timestamp) instead of
// filing another issue. Success: comment and close every open match.
// Lookup is by the `ci-failure` label and by title prefix. Only titles that
// start with TITLE_PREFIX are touched, so other ci-failure reports stay open.

const TITLE_PREFIX = '[CI] Daily ingest failed';
const LABELS = ['ci-failure', 'auto'];

function isDailyFailureIssue(issue) {
  if (!issue || issue.pull_request) return false;
  if (typeof issue.title !== 'string') return false;
  return issue.title.startsWith(TITLE_PREFIX);
}

function asIssueList(value, source) {
  if (!Array.isArray(value)) {
    const error = new Error(`Expected an issue list from ${source}`);
    error.status = 500;
    throw error;
  }
  return value;
}

function mergeIssues(groups) {
  const seen = new Map();
  for (const issue of groups) {
    if (!isDailyFailureIssue(issue) || issue.number == null) continue;
    seen.set(issue.number, issue);
  }
  return [...seen.values()].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at),
  );
}

function runUrl(context) {
  const { owner, repo } = context.repo;
  return `${context.serverUrl}/${owner}/${repo}/actions/runs/${context.runId}`;
}

function issueTitle(timestamp) {
  return `${TITLE_PREFIX} ${timestamp.slice(0, 10)}`;
}

function failureComment({ timestamp, runUrl: url, extraOpenCount }) {
  const lines = [
    `Another daily ingest failure at ${timestamp}.`,
    '',
    `Run: ${url}`,
  ];
  if (extraOpenCount > 0) {
    lines.push(
      '',
      `${extraOpenCount} other open issue(s) titled \`${TITLE_PREFIX}\` will be closed together after the next successful daily run.`,
    );
  }
  return lines.join('\n');
}

function newIssueBody({ timestamp, runUrl: url }) {
  return [
    'Daily workflow failed.',
    '',
    `Run: ${url}`,
    `Timestamp: ${timestamp}`,
    '',
    'Likely culprits:',
    '- AkShare upstream rename / EastMoney scrape break',
    '- multpl HTML structure change',
    '- yfinance rate-limit (curl-cffi backoff)',
    '- FRED secret missing/expired',
    '',
    'Re-run from the Actions UI once root cause is fixed.',
    '',
    'Later failures append a comment here instead of opening another issue. A successful daily run closes this issue automatically.',
  ].join('\n');
}

function successComment({ timestamp, runUrl: url }) {
  return [
    `Daily ingest succeeded again at ${timestamp}.`,
    '',
    `Run: ${url}`,
    '',
    'Closing this issue.',
  ].join('\n');
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function withRetry(fn, core) {
  const delays = [0, 2000, 5000];
  let lastError;
  for (const delay of delays) {
    if (delay) await sleep(delay);
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error && error.status;
      if (status !== 403 && status !== 502 && status !== 503 && status !== 504) {
        throw error;
      }
      core.warning(`GitHub API ${status}; retrying: ${error.message}`);
    }
  }
  throw lastError;
}

async function findOpenDailyFailures({ github, context, core }) {
  const { owner, repo } = context.repo;
  let labeled = [];
  try {
    labeled = asIssueList(
      await github.paginate(github.rest.issues.listForRepo, {
        owner,
        repo,
        state: 'open',
        labels: 'ci-failure',
        per_page: 100,
      }),
      'issues.listForRepo',
    );
  } catch (error) {
    if (error && error.status === 404) {
      core.warning('Label ci-failure was not found; continuing with title search.');
    } else {
      throw error;
    }
  }

  let searched = [];
  try {
    searched = asIssueList(
      await github.paginate(github.rest.search.issuesAndPullRequests, {
        q: `repo:${owner}/${repo} is:issue is:open in:title "${TITLE_PREFIX}"`,
        per_page: 100,
      }),
      'search.issuesAndPullRequests',
    );
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    core.warning(`Title search failed; continuing with label matches only: ${message}`);
  }

  return mergeIssues([...labeled, ...searched]);
}

async function handleFailure({ github, context, core, now = new Date() }) {
  const { owner, repo } = context.repo;
  const url = runUrl(context);
  const timestamp = now.toISOString();
  const openIssues = await findOpenDailyFailures({ github, context, core });

  if (openIssues.length > 0) {
    const target = openIssues[0];
    await withRetry(
      () =>
        github.rest.issues.createComment({
          owner,
          repo,
          issue_number: target.number,
          body: failureComment({
            timestamp,
            runUrl: url,
            extraOpenCount: openIssues.length - 1,
          }),
        }),
      core,
    );
    core.notice(
      `Commented on existing issue #${target.number} instead of opening a duplicate.`,
    );
    return { action: 'commented', issue: target.number };
  }

  const created = await withRetry(
    () =>
      github.rest.issues.create({
        owner,
        repo,
        title: issueTitle(timestamp),
        labels: LABELS,
        body: newIssueBody({ timestamp, runUrl: url }),
      }),
    core,
  );
  core.notice(`Opened issue #${created.data.number}.`);
  return { action: 'created', issue: created.data.number };
}

async function handleSuccess({ github, context, core, now = new Date() }) {
  const { owner, repo } = context.repo;
  const url = runUrl(context);
  const timestamp = now.toISOString();
  const openIssues = await findOpenDailyFailures({ github, context, core });

  if (openIssues.length === 0) {
    core.notice('No open daily-ingest failure issues to close.');
    return { action: 'none', closed: [] };
  }

  const closed = [];
  for (const issue of openIssues) {
    const body = successComment({ timestamp, runUrl: url });
    try {
      await withRetry(
        () =>
          github.rest.issues.createComment({
            owner,
            repo,
            issue_number: issue.number,
            body,
          }),
        core,
      );
      await withRetry(
        () =>
          github.rest.issues.update({
            owner,
            repo,
            issue_number: issue.number,
            state: 'closed',
            state_reason: 'completed',
          }),
        core,
      );
    } catch (error) {
      if (error && (error.status === 404 || error.status === 410)) {
        core.warning(`Issue #${issue.number} disappeared before close: ${error.message}`);
        continue;
      }
      throw error;
    }
    closed.push(issue.number);
    core.notice(`Closed #${issue.number}.`);
  }
  return { action: 'closed', closed };
}

module.exports = {
  TITLE_PREFIX,
  LABELS,
  isDailyFailureIssue,
  mergeIssues,
  failureComment,
  newIssueBody,
  successComment,
  issueTitle,
  findOpenDailyFailures,
  handleFailure,
  handleSuccess,
};
