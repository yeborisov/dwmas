import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRepositoryAccess } from '../middleware/repositoryAccess.js';

const issueSchema = z.object({ title: z.string().min(3), description: z.string().min(3) });

export const issuesRouter = Router();
issuesRouter.use(requireAuth);

issuesRouter.get('/repositories/:repoId/issues', requireRepositoryAccess, async (req, res) => {
  const repoId = String(req.params.repoId);
  const data = await prisma.issue.findMany({
    where: { repositoryId: repoId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, username: true, displayName: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, username: true, displayName: true } } }
      }
    }
  });
  res.json({ success: true, data });
});

issuesRouter.post('/repositories/:repoId/issues', requireRepositoryAccess, async (req, res) => {
  const payload = issueSchema.parse(req.body);
  const repoId = String(req.params.repoId);
  const issue = await prisma.issue.create({
    data: { ...payload, repositoryId: repoId, authorId: req.user!.id }
  });
  res.status(201).json({ success: true, data: issue });
});

issuesRouter.get('/repositories/:repoId/issues/:issueId', requireRepositoryAccess, async (req, res) => {
  const issue = await prisma.issue.findUnique({
    where: { id: String(req.params.issueId) },
    include: {
      author: { select: { id: true, username: true, displayName: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, username: true, displayName: true } } }
      }
    }
  });
  if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
  return res.json({ success: true, data: issue });
});

issuesRouter.get('/issues/:issueId', async (req, res) => {
  const issue = await prisma.issue.findUnique({
    where: { id: String(req.params.issueId) },
    include: {
      author: { select: { id: true, username: true, displayName: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, username: true, displayName: true } } }
      }
    }
  });
  if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
  return res.json({ success: true, data: issue });
});

issuesRouter.put('/repositories/:repoId/issues/:issueId', requireRepositoryAccess, async (req, res) => {
  const payload = issueSchema.partial().parse(req.body);
  const issue = await prisma.issue.update({ where: { id: String(req.params.issueId) }, data: payload });
  res.json({ success: true, data: issue });
});

issuesRouter.delete('/repositories/:repoId/issues/:issueId', requireRepositoryAccess, async (req, res) => {
  await prisma.issue.delete({ where: { id: String(req.params.issueId) } });
  res.json({ success: true });
});
