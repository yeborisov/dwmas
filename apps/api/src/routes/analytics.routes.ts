import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { getAnalyticsSummary } from '../services/analytics.service.js';

export const analyticsRouter = Router();

async function getAccessibleRepoIds(user?: { id: string; role: string }) {
  if (!user || user.role !== 'DEVELOPER') return undefined;
  const repos = await prisma.repository.findMany({
    where: {
      OR: [{ createdByUserId: user.id }, { assignments: { some: { userId: user.id } } }]
    },
    select: { id: true }
  });
  return repos.map((repo) => repo.id);
}

analyticsRouter.get('/summary', async (_req, res) => {
  const summary = await getAnalyticsSummary();
  res.json({ success: true, data: summary });
});

analyticsRouter.get('/', requireAuth, async (req, res) => {
  const repoIds = await getAccessibleRepoIds(req.user);
  const summary = await getAnalyticsSummary(repoIds);
  res.json({ success: true, data: summary });
});

analyticsRouter.get('/trends', requireAuth, async (req, res) => {
  const repoIds = await getAccessibleRepoIds(req.user);
  const rows = await prisma.workflowRun.groupBy({
    by: ['repositoryId'],
    _avg: { durationMs: true },
    _count: true,
    where: repoIds ? { repositoryId: { in: repoIds } } : undefined
  });
  res.json({ success: true, data: rows });
});

analyticsRouter.get('/failure-rate', requireAuth, async (req, res) => {
  const repoIds = await getAccessibleRepoIds(req.user);
  const repos = await prisma.repository.findMany({
    where: repoIds ? { id: { in: repoIds } } : undefined,
    include: {
      workflowRuns: {
        select: { conclusion: true }
      }
    }
  });
  const data = repos.map((repo: any) => {
    const total = repo.workflowRuns.length;
    const failed = repo.workflowRuns.filter((r: any) => r.conclusion === 'failure').length;
    return { repository: repo.fullName, failureRate: total ? Number(((failed / total) * 100).toFixed(2)) : 0 };
  });
  res.json({ success: true, data });
});

analyticsRouter.get('/repositories', requireAuth, async (req, res) => {
  const repoIds = await getAccessibleRepoIds(req.user);
  const data = await prisma.repository.findMany({
    where: repoIds ? { id: { in: repoIds } } : undefined,
    include: { _count: { select: { workflowRuns: true } } }
  });
  res.json({ success: true, data });
});
