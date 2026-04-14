import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { githubService } from '../services/github.service.js';
import { requireRepositoryAccess } from '../middleware/repositoryAccess.js';

const issueSchema = z.object({ title: z.string().min(3), description: z.string().min(3) });

export const issuesRouter = Router();
issuesRouter.use(requireAuth);

function resolveIssueNumber(issue: { githubIssueNumber?: number | null; githubIssueUrl?: string | null; description?: string | null }) {
  if (issue.githubIssueNumber) return issue.githubIssueNumber;
  const urlMatch = issue.githubIssueUrl?.match(/\/issues\/(\d+)/i);
  if (urlMatch) return Number(urlMatch[1]);
  const descMatch = issue.description?.match(/\/issues\/(\d+)/i);
  return descMatch ? Number(descMatch[1]) : null;
}

issuesRouter.get('/repositories/:repoId/issues', requireRepositoryAccess, async (req, res) => {
  const repoId = String(req.params.repoId);
  const data = await prisma.issue.findMany({
    where: { repositoryId: repoId },
    orderBy: { createdAt: 'desc' },
    include: {
      repository: { select: { id: true, owner: true, name: true, fullName: true } },
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
      repository: { select: { id: true, owner: true, name: true, fullName: true } },
      author: { select: { id: true, username: true, displayName: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, username: true, displayName: true } } }
      }
    }
  });
  if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

  const issueNumber = resolveIssueNumber(issue as any);
  if (issueNumber && issue.repository) {
    try {
      const ghIssue = await githubService.getIssue(issue.repository.owner, issue.repository.name, issueNumber);
      if (ghIssue.data.state && ghIssue.data.state.toUpperCase() !== issue.status) {
        await prisma.issue.update({
          where: { id: issue.id },
          data: {
            status: ghIssue.data.state.toUpperCase() === 'CLOSED' ? 'CLOSED' : 'OPEN',
            githubIssueState: ghIssue.data.state,
            githubIssueUrl: ghIssue.data.html_url
          } as any
        });
      }
    } catch {
      // ignore GitHub sync errors for now
    }
  }

  return res.json({ success: true, data: issue });
});

issuesRouter.get('/issues/:issueId', async (req, res) => {
  const issue = await prisma.issue.findUnique({
    where: { id: String(req.params.issueId) },
    include: {
      repository: { select: { id: true, owner: true, name: true, fullName: true } },
      author: { select: { id: true, username: true, displayName: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, username: true, displayName: true } } }
      }
    }
  });
  if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

  const issueNumber = resolveIssueNumber(issue as any);
  if (issueNumber && issue.repository) {
    try {
      const ghIssue = await githubService.getIssue(issue.repository.owner, issue.repository.name, issueNumber);
      if (ghIssue.data.state && ghIssue.data.state.toUpperCase() !== issue.status) {
        await prisma.issue.update({
          where: { id: issue.id },
          data: {
            status: ghIssue.data.state.toUpperCase() === 'CLOSED' ? 'CLOSED' : 'OPEN',
            githubIssueState: ghIssue.data.state,
            githubIssueUrl: ghIssue.data.html_url
          } as any
        });
      }
    } catch {
      // ignore GitHub sync errors for now
    }
  }

  return res.json({ success: true, data: issue });
});

issuesRouter.get('/issues/mine', async (req, res) => {
  const issues = await prisma.issue.findMany({
    where: {
      OR: [
        { authorId: req.user!.id },
        { comments: { some: { authorId: req.user!.id } } }
      ]
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      repository: { select: { id: true, owner: true, name: true, fullName: true } },
      author: { select: { id: true, username: true, displayName: true } }
    }
  });
  return res.json({ success: true, data: issues });
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
