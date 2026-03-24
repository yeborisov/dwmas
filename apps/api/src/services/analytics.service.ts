import { prisma } from '../config/prisma.js';

export async function getAnalyticsSummary(repositoryIds?: string[]) {
  const where = repositoryIds ? { repositoryId: { in: repositoryIds } } : undefined;
  const [total, successful, failed, inProgress, avgDuration] = await Promise.all([
    prisma.workflowRun.count({ where }),
    prisma.workflowRun.count({ where: { ...where, conclusion: 'success' } }),
    prisma.workflowRun.count({ where: { ...where, conclusion: 'failure' } }),
    prisma.workflowRun.count({ where: { ...where, status: 'in_progress' } }),
    prisma.workflowRun.aggregate({ where, _avg: { durationMs: true } })
  ]);

  return {
    totalRuns: total,
    successfulRuns: successful,
    failedRuns: failed,
    inProgressRuns: inProgress,
    averageDurationMs: Math.round(avgDuration._avg.durationMs ?? 0)
  };
}
