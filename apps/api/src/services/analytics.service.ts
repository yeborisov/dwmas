import { prisma } from '../config/prisma.js';

export async function getAnalyticsSummary() {
  const [total, successful, failed, inProgress, avgDuration] = await Promise.all([
    prisma.workflowRun.count(),
    prisma.workflowRun.count({ where: { conclusion: 'success' } }),
    prisma.workflowRun.count({ where: { conclusion: 'failure' } }),
    prisma.workflowRun.count({ where: { status: 'in_progress' } }),
    prisma.workflowRun.aggregate({ _avg: { durationMs: true } })
  ]);

  return {
    totalRuns: total,
    successfulRuns: successful,
    failedRuns: failed,
    inProgressRuns: inProgress,
    averageDurationMs: Math.round(avgDuration._avg.durationMs ?? 0)
  };
}
