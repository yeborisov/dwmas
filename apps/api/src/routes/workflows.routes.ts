import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { syncRepositoryRuns } from '../services/sync.service.js';
import { githubService } from '../services/github.service.js';

export const workflowsRouter = Router();
workflowsRouter.use(requireAuth);

workflowsRouter.get('/', async (req, res) => {
  const { status, conclusion, branch, repositoryId, actor, from, to } = req.query;
  const refresh = String(req.query.refresh || '').toLowerCase() === 'true';
  const requestedRepoId = repositoryId ? String(repositoryId) : undefined;
  const staleAfterMs = 5 * 60 * 1000;

  const allowedRepoIds =
    req.user!.role === 'DEVELOPER'
      ? (
          await prisma.repository.findMany({
            where: {
              OR: [{ createdByUserId: req.user!.id }, { assignments: { some: { userId: req.user!.id } } }]
            },
            select: { id: true }
          })
        ).map((repo) => repo.id)
      : undefined;

  const accessibleRepoIds = allowedRepoIds
    ? allowedRepoIds
    : (
        await prisma.repository.findMany({
          select: { id: true }
        })
      ).map((repo) => repo.id);

  if (refresh && requestedRepoId) {
    await syncRepositoryRuns(requestedRepoId).catch(() => undefined);
  }

  if (!refresh && requestedRepoId) {
    const repo = await prisma.repository.findUnique({ where: { id: requestedRepoId } });
    const isStale = !repo?.lastSuccessfulSyncAt || Date.now() - repo.lastSuccessfulSyncAt.getTime() > staleAfterMs;
    if (isStale) {
      syncRepositoryRuns(requestedRepoId).catch(() => undefined);
    }
  }

  const data = await prisma.workflowRun.findMany({
    where: {
      status: status ? String(status) : undefined,
      conclusion: conclusion ? String(conclusion) : undefined,
      branch: branch ? String(branch) : undefined,
      actor: actor ? String(actor) : undefined,
      repositoryId: requestedRepoId
        ? req.user!.role === 'DEVELOPER' && allowedRepoIds
          ? { equals: requestedRepoId, in: allowedRepoIds }
          : requestedRepoId
        : allowedRepoIds
          ? { in: allowedRepoIds }
          : undefined,
      startedAt: from || to ? { gte: from ? new Date(String(from)) : undefined, lte: to ? new Date(String(to)) : undefined } : undefined
    },
    orderBy: { startedAt: 'desc' },
    include: { repository: true }
  });

  res.json({ success: true, data });
});

workflowsRouter.get('/:workflowId', async (req, res) => {
  const run = await prisma.workflowRun.findUnique({
    where: { id: req.params.workflowId },
    include: { repository: true, jobs: true }
  });
  if (!run) return res.status(404).json({ success: false, message: 'Workflow not found' });

  if (req.user!.role === 'DEVELOPER') {
    const allowed = await prisma.repository.findFirst({
      where: {
        id: run.repositoryId,
        OR: [{ createdByUserId: req.user!.id }, { assignments: { some: { userId: req.user!.id } } }]
      },
      select: { id: true }
    });

    if (!allowed) return res.status(403).json({ success: false, message: 'No repository access for this workflow run' });
  }

  return res.json({ success: true, data: run });
});

workflowsRouter.get('/:workflowId/jobs', async (req, res) => {
  const jobs = await prisma.job.findMany({ where: { workflowRunId: req.params.workflowId } });
  res.json({ success: true, data: jobs });
});

workflowsRouter.get('/:workflowId/issues', async (req, res) => {
  const workflowId = String(req.params.workflowId);
  const issue = await prisma.issue.findFirst({
    where: {
      description: {
        contains: `Run ID: ${workflowId}`,
        mode: 'insensitive'
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, username: true, displayName: true } }
    }
  });

  return res.json({ success: true, data: issue ?? null });
});

workflowsRouter.post('/:workflowId/issues', async (req, res) => {
  const workflowId = String(req.params.workflowId);
  const run = await prisma.workflowRun.findUnique({
    where: { id: workflowId },
    include: { repository: true }
  });

  if (!run) return res.status(404).json({ success: false, message: 'Workflow not found' });

  if ((run.conclusion || '').toLowerCase() !== 'failure') {
    return res.status(400).json({ success: false, message: 'Issue creation is only available for failed workflow runs' });
  }

  if (req.user!.role === 'DEVELOPER') {
    const allowed = await prisma.repository.findFirst({
      where: {
        id: run.repositoryId,
        OR: [{ createdByUserId: req.user!.id }, { assignments: { some: { userId: req.user!.id } } }]
      },
      select: { id: true }
    });

    if (!allowed) return res.status(403).json({ success: false, message: 'No repository access for this workflow run' });
  }

  const buildIssueBody = () =>
    [
      `DWMAS detected a failed workflow run and opened this issue automatically.`,
      '',
      `Repository: ${run.repository.fullName}`,
      `Run ID: ${run.id}`,
      `Status: ${run.status}`,
      `Conclusion: ${run.conclusion || 'unknown'}`,
      `Branch: ${run.branch || '-'}`,
      `Actor: ${run.actor || '-'}`,
      `Started: ${run.startedAt ? new Date(run.startedAt).toISOString() : '-'}`,
      run.htmlUrl ? `Run URL: ${run.htmlUrl}` : null
    ]
      .filter(Boolean)
      .join('\n');

  const existing = await prisma.issue.findFirst({
    where: {
      repositoryId: run.repositoryId,
      title: {
        contains: run.workflowName,
        mode: 'insensitive'
      },
      status: 'OPEN'
    },
    orderBy: { createdAt: 'desc' }
  });

  if (existing) {
    if (!/github issue:/i.test(existing.description)) {
      const ghIssue = await githubService.createIssue(
        run.repository.owner,
        run.repository.name,
        `[DWMAS] Workflow failure: ${run.workflowName}`,
        buildIssueBody()
      );

      const updated = await prisma.issue.update({
        where: { id: existing.id },
        data: {
          description: `${existing.description}\n\nGitHub issue: ${ghIssue.data.html_url}`
        },
        include: {
          author: { select: { id: true, username: true, displayName: true } },
          comments: true
        }
      });

      return res.json({ success: true, data: updated, message: 'Existing issue linked to GitHub issue' });
    }

    return res.json({ success: true, data: existing, message: 'Existing open issue reused' });
  }

  const title = `Workflow failure: ${run.workflowName}`;
  const ghIssue = await githubService.createIssue(
    run.repository.owner,
    run.repository.name,
    `[DWMAS] ${title}`,
    buildIssueBody()
  );

  const description = `${buildIssueBody()}\n\nGitHub issue: ${ghIssue.data.html_url}`;

  const issue = await prisma.issue.create({
    data: {
      repositoryId: run.repositoryId,
      authorId: req.user!.id,
      title,
      description
    },
    include: {
      author: { select: { id: true, username: true, displayName: true } },
      comments: true
    }
  });

  return res.status(201).json({ success: true, data: issue });
});
