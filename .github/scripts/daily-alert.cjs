const ALERT_MARKER = '<!-- finsynapse:daily:main -->';
const ALERT_TITLE = '[CI] Daily ingest/publish failing';
const BOT = 'github-actions[bot]';

// Runs in actions/github-script. Keep the GitHub client injectable so the
// lifecycle can be exercised offline, without creating real issues.
module.exports = async function updateAlert({ github, context, core, result, runAttempt }) {
  if (context.ref !== 'refs/heads/main' || !['success', 'failure'].includes(result)) {
    core.info('No main-branch success/failure to report.');
    return;
  }

  const repo = context.repo;
  const { data: run } = await github.rest.actions.getWorkflowRun({ ...repo, run_id: context.runId });
  const { data: latest } = await github.rest.actions.listWorkflowRuns({
    ...repo,
    workflow_id: run.workflow_id,
    branch: 'main',
    status: 'completed',
    per_page: 1,
  });
  // Re-running an old workflow must not resolve (or reopen) a newer incident.
  // Only finished runs supersede this result; a queued run is not recovery.
  // Also reject a stale attempt of the same run.
  if (run.run_attempt !== runAttempt || latest.workflow_runs.some(r => r.run_number > run.run_number)) {
    core.info('A newer run or attempt supersedes this result; leaving alerts unchanged.');
    return;
  }

  const runUrl = `${context.serverUrl}/${repo.owner}/${repo.repo}/actions/runs/${context.runId}`;
  const attemptUrl = `${runUrl}/attempts/${runAttempt}`;
  // A failed lookup must throw, rather than being mistaken for no open alert.
  const issues = await github.paginate(github.rest.issues.listForRepo, {
    ...repo,
    state: 'open',
    labels: 'ci-failure,auto',
    per_page: 100,
  });
  const alerts = issues.filter(issue => {
    const labels = issue.labels.map(label => typeof label === 'string' ? label : label.name);
    const owned = !issue.pull_request && issue.user?.login === BOT &&
      ['ci-failure', 'auto'].every(label => labels.includes(label));
    const body = issue.body || '';
    const legacy = /^\[CI\] Daily ingest failed \d{4}-\d{2}-\d{2}$/.test(issue.title) &&
      body.startsWith('Daily workflow failed.\n') &&
      body.includes(`Run: ${context.serverUrl}/${repo.owner}/${repo.repo}/actions/runs/`);
    return owned && (body.includes(ALERT_MARKER) || legacy);
  });

  const eventMarker = `<!-- finsynapse:daily:main:${context.runId}:${runAttempt}:${result} -->`;
  const eventBody = [
    eventMarker,
    result === 'success' ? 'Daily workflow recovered.' : 'Daily workflow failed.',
    '',
    `Run: ${attemptUrl}`,
  ].join('\n');

  async function commentOnce(issue, marker, body) {
    if ((issue.body || '').includes(marker)) return;
    const comments = await github.paginate(github.rest.issues.listComments, {
      ...repo,
      issue_number: issue.number,
      per_page: 100,
    });
    if (!comments.some(comment => comment.user?.login === BOT && (comment.body || '').includes(marker))) {
      await github.rest.issues.createComment({ ...repo, issue_number: issue.number, body });
    }
  }

  if (result === 'success') {
    for (const issue of alerts) {
      await commentOnce(issue, eventMarker, eventBody);
      await github.rest.issues.update({
        ...repo,
        issue_number: issue.number,
        state: 'closed',
        state_reason: 'completed',
      });
    }
    core.info(`Closed ${alerts.length} recovered daily alert(s).`);
    return;
  }

  // Prefer an already migrated alert; otherwise adopt the newest legacy issue.
  alerts.sort((a, b) =>
    Number((b.body || '').includes(ALERT_MARKER)) - Number((a.body || '').includes(ALERT_MARKER)) ||
    b.number - a.number);
  let canonical = alerts[0];
  if (!canonical) {
    const { data } = await github.rest.issues.create({
      ...repo,
      title: ALERT_TITLE,
      labels: ['ci-failure', 'auto'],
      body: [ALERT_MARKER, eventBody, '', 'Further failures are appended here until a main-branch run succeeds.'].join('\n'),
    });
    canonical = data;
  } else {
    if (!(canonical.body || '').includes(ALERT_MARKER)) {
      const { data } = await github.rest.issues.update({
        ...repo,
        issue_number: canonical.number,
        title: ALERT_TITLE,
        body: `${ALERT_MARKER}\n${canonical.body || ''}`,
      });
      canonical = data;
    }
    await commentOnce(canonical, eventMarker, eventBody);
  }

  for (const issue of alerts.filter(issue => issue.number !== canonical.number)) {
    const marker = `<!-- finsynapse:daily:main:merged:${canonical.number} -->`;
    await commentOnce(issue, marker, `${marker}\nConsolidated into #${canonical.number}. Latest failed run: ${attemptUrl}`);
    await github.rest.issues.update({
      ...repo,
      issue_number: issue.number,
      state: 'closed',
      state_reason: 'not_planned',
    });
  }
  core.info(`Daily incident is tracked in #${canonical.number}.`);
};
