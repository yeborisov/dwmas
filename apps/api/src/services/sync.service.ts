import { prisma } from '../config/prisma.js';
import { githubService } from './github.service.js';

const ensureString = (value: string | null | undefined, fallback: string) => (value && value.trim().length ? value : fallback);

export async function syncRepositoryRuns(repositoryId: string) {
  const repository = await prisma.repository.findUnique({ where: { id: repositoryId } });
  if (!repository) throw new Error('Repository not found');

  await prisma.repository.update({
    where: { id: repositoryId },
    data: { syncStatus: 'SYNCING', syncError: null }
  });

  try {
    const runsResponse = await githubService.listWorkflowRuns(repository.owner, repository.name);
    const syncedRuns = [] as string[];
    let newestSourceUpdate: Date | null = null;

    for (const run of runsResponse.data.workflow_runs) {
      const startedAt = run.run_started_at ? new Date(run.run_started_at) : null;
      const completedAt = run.updated_at ? new Date(run.updated_at) : null;
      const sourceUpdatedAt = run.updated_at ? new Date(run.updated_at) : null;
      const durationMs = startedAt && completedAt ? completedAt.getTime() - startedAt.getTime() : null;

      if (sourceUpdatedAt && (!newestSourceUpdate || sourceUpdatedAt > newestSourceUpdate)) {
        newestSourceUpdate = sourceUpdatedAt;
      }

      const upsertedRun = await prisma.workflowRun.upsert({
        where: { githubRunId: String(run.id) },
        update: {
          workflowName: ensureString(run.name, 'Unnamed workflow'),
          status: ensureString(run.status, 'unknown'),
          conclusion: run.conclusion,
          branch: run.head_branch,
          event: run.event,
          actor: run.actor?.login,
          commitSha: run.head_sha,
          htmlUrl: run.html_url,
          logsUrl: run.logs_url,
          runNumber: run.run_number,
          startedAt,
          completedAt,
          durationMs: durationMs ? Math.max(durationMs, 0) : null,
          sourceUpdatedAt
        },
        create: {
          githubRunId: String(run.id),
          repositoryId,
          workflowName: ensureString(run.name, 'Unnamed workflow'),
          status: ensureString(run.status, 'unknown'),
          conclusion: run.conclusion,
          branch: run.head_branch,
          event: run.event,
          actor: run.actor?.login,
          commitSha: run.head_sha,
          htmlUrl: run.html_url,
          logsUrl: run.logs_url,
          runNumber: run.run_number,
          startedAt,
          completedAt,
          durationMs: durationMs ? Math.max(durationMs, 0) : null,
          sourceUpdatedAt
        }
      });
      syncedRuns.push(upsertedRun.id);

      const jobsResponse = await githubService.listJobsForRun(repository.owner, repository.name, run.id);
      for (const job of jobsResponse.data.jobs) {
        await prisma.job.upsert({
          where: { githubJobId: String(job.id) },
          update: {
            workflowRunId: upsertedRun.id,
            name: job.name,
            status: ensureString(job.status, 'unknown'),
            conclusion: job.conclusion,
            startedAt: job.started_at ? new Date(job.started_at) : null,
            completedAt: job.completed_at ? new Date(job.completed_at) : null,
            durationMs:
              job.started_at && job.completed_at
                ? new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()
                : null,
            runnerName: job.runner_name,
            htmlUrl: job.html_url
          },
          create: {
            githubJobId: String(job.id),
            workflowRunId: upsertedRun.id,
            name: job.name,
            status: ensureString(job.status, 'unknown'),
            conclusion: job.conclusion,
            startedAt: job.started_at ? new Date(job.started_at) : null,
            completedAt: job.completed_at ? new Date(job.completed_at) : null,
            durationMs:
              job.started_at && job.completed_at
                ? new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()
                : null,
            runnerName: job.runner_name,
            htmlUrl: job.html_url
          }
        });
      }
    }

    await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        syncStatus: 'SUCCESS',
        syncError: null,
        lastSyncedAt: new Date(),
        lastSuccessfulSyncAt: new Date(),
        sourceUpdatedAt: newestSourceUpdate
      }
    });

    return { count: syncedRuns.length, syncedAt: new Date().toISOString() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync failure';
    await prisma.repository.update({
      where: { id: repositoryId },
      data: { syncStatus: 'ERROR', syncError: message, lastSyncedAt: new Date() }
    });
    throw new Error(`GitHub sync failed for ${repository.fullName}: ${message}`);
  }
}
