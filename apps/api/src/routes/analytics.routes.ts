import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { getAnalyticsSummary } from '../services/analytics.service.js';

export const analyticsRouter = Router();

analyticsRouter.get('/summary', async (_req, res) => {
  const summary = await getAnalyticsSummary();
  res.json({ success: true, data: summary });
});

analyticsRouter.get('/', requireAuth, async (_req, res) => {
  const summary = await getAnalyticsSummary();
  res.json({ success: true, data: summary });
});

analyticsRouter.get('/trends', requireAuth, async (_req, res) => {
  const rows = await prisma.workflowRun.groupBy({
    by: ['repositoryId'],
    _avg: { durationMs: true },
    _count: true
  });
  res.json({ success: true, data: rows });
});

analyticsRouter.get('/failure-rate', requireAuth, async (_req, res) => {
  const repos = await prisma.repository.findMany({
    include: {
      workflowRuns: {
        select: { conclusion: true }
      }
    }
  });
  const data = repos.map((repo) => {
    const total = repo.workflowRuns.length;
    const failed = repo.workflowRuns.filter((r) => r.conclusion === 'failure').length;
    return { repository: repo.fullName, failureRate: total ? Number(((failed / total) * 100).toFixed(2)) : 0 };
  });
  res.json({ success: true, data });
});

analyticsRouter.get('/repositories', requireAuth, async (_req, res) => {
  const data = await prisma.repository.findMany({
    include: { _count: { select: { workflowRuns: true } } }
  });
  res.json({ success: true, data });
});
