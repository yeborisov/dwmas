import { prisma } from '../config/prisma.js';
import { githubService } from './github.service.js';
import type { GithubWorkflowRun, GithubJob } from './github.service.js';
import { logger } from '../config/logger.js';

const ensureString = (value: string | null | undefined, fallback: string) => (value && value.trim().length ? value : fallback);

/** Batch size for Prisma upsert operations to avoid overwhelming the DB */
const DB_BATCH_SIZE = 50;

export async function syncRepositoryRuns(repositoryId: string) {
  const repository = await prisma.repository.findUnique({ where: { id: repositoryId } });
  if (!repository) throw new Error('Repository not found');

  await prisma.repository.update({
    where: { id: repositoryId },
    data: { syncStatus: 'SYNCING', syncError: null }
  });

  try {
    /* ── Step 1: Fetch all workflow runs (GraphQL-first, cached) ─────── */
    const runsResponse = await githubService.listWorkflowRuns(repository.owner, repository.name);
    const runs: GithubWorkflowRun[] = runsResponse.data.workflow_runs;

    logger.info(`Syncing ${runs.length} runs for ${repository.fullName}`);

    /* ── Step 2: Upsert workflow runs in batches ────────────────────── */
    const syncedRuns: Array<{ dbId: string; githubRunId: number }> = [];
    let newestSourceUpdate: Date | null = null;

    for (let i = 0; i < runs.length; i += DB_BATCH_SIZE) {
      const batch = runs.slice(i, i + DB_BATCH_SIZE);

      const upsertPromises = batch.map((run) => {
        const startedAt = run.run_started_at ? new Date(run.run_started_at) : null;
        const completedAt = run.updated_at ? new Date(run.updated_at) : null;
        const sourceUpdatedAt = run.updated_at ? new Date(run.updated_at) : null;
        const durationMs = startedAt && completedAt ? completedAt.getTime() - startedAt.getTime() : null;

        if (sourceUpdatedAt && (!newestSourceUpdate || sourceUpdatedAt > newestSourceUpdate)) {
          newestSourceUpdate = sourceUpdatedAt;
        }

        const data = {
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
        };

        return prisma.workflowRun.upsert({
          where: { githubRunId: String(run.id) },
          update: data,
          create: { githubRunId: String(run.id), repositoryId, ...data }
        });
      });

      const results = await Promise.all(upsertPromises);
      for (let j = 0; j < results.length; j++) {
        syncedRuns.push({ dbId: results[j].id, githubRunId: batch[j].id });
      }
    }

    /* ── Step 3: Batch-fetch jobs via GraphQL (N runs → ceil(N/25) requests) */
    const runIds = syncedRuns.map((r) => r.githubRunId);
    const allJobs = await githubService.batchListJobsForRuns(
      repository.owner,
      repository.name,
      runIds
    );

    /* ── Step 4: Upsert jobs in batches ─────────────────────────────── */
    const jobUpserts: Array<Promise<unknown>> = [];

    for (const { dbId, githubRunId } of syncedRuns) {
      const jobs: GithubJob[] = allJobs.get(githubRunId) ?? [];

      for (const job of jobs) {
        const jobData = {
          workflowRunId: dbId,
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
        };

        jobUpserts.push(
          prisma.job.upsert({
            where: { githubJobId: String(job.id) },
            update: jobData,
            create: { githubJobId: String(job.id), ...jobData }
          })
        );

        // Execute in batches to avoid overwhelming DB connection pool
        if (jobUpserts.length >= DB_BATCH_SIZE) {
          await Promise.all(jobUpserts.splice(0, DB_BATCH_SIZE));
        }
      }
    }

    // Flush remaining job upserts
    if (jobUpserts.length > 0) {
      await Promise.all(jobUpserts);
    }

    /* ── Step 5: Update repository sync status ──────────────────────── */
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

    logger.info(`Sync complete for ${repository.fullName}: ${syncedRuns.length} runs, jobs batch-fetched`);

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