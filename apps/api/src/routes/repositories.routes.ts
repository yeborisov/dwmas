import { Router } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { githubService } from '../services/github.service.js';
import { syncRepositoryRuns } from '../services/sync.service.js';

const createSchema = z.object({
  owner: z.string().trim().optional(),
  name: z.string().trim().optional(),
  repositoryUrl: z.string().trim().optional()
});

function parseRepositoryUrl(repositoryUrl: string): { owner: string; name: string } | null {
  const normalized = repositoryUrl.trim();

  const httpsMatch = normalized.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  if (httpsMatch) return { owner: httpsMatch[1], name: httpsMatch[2] };

  const sshMatch = normalized.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (sshMatch) return { owner: sshMatch[1], name: sshMatch[2] };

  return null;
}

export const repositoriesRouter = Router();
repositoriesRouter.use(requireAuth);

repositoriesRouter.get('/', async (req, res) => {
  const where = req.user?.role === 'DEVELOPER'
    ? {
        OR: [
          { assignments: { some: { userId: req.user.id } } },
          { createdByUserId: req.user.id }
        ]
      }
    : {};
  const data = await prisma.repository.findMany({ where });
  res.json({ success: true, data });
});

repositoriesRouter.post('/', requireRoles('DEVELOPER', 'DEVOPS', 'ADMIN'), async (req, res) => {
  const payload = createSchema.parse(req.body);

  let owner = payload.owner?.trim() || '';
  let name = payload.name?.trim() || '';

  if (payload.repositoryUrl) {
    const parsed = parseRepositoryUrl(payload.repositoryUrl);
    if (!parsed) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GitHub repository URL. Use format like https://github.com/owner/repository'
      });
    }
    owner = parsed.owner;
    name = parsed.name;
  }

  if (!owner || !name) {
    return res.status(400).json({
      success: false,
      message: 'Provide owner + repository name, or provide a full GitHub repository URL.'
    });
  }

  let repo;
  try {
    repo = await githubService.getRepository(owner.trim(), name.trim());
  } catch (error) {
    const status = typeof error === 'object' && error !== null && 'status' in error ? (error as { status?: number }).status : undefined;
    if (status === 404) {
      return res.status(404).json({
        success: false,
        message: `GitHub repository not found: ${owner}/${name}. Check owner/repository spelling (example: yeborisov/devops-project).`
      });
    }
    throw error;
  }

  try {
    const created = await prisma.repository.create({
      data: {
        githubRepoId: String(repo.data.id),
        owner: repo.data.owner.login,
        name: repo.data.name,
        fullName: repo.data.full_name,
        isPrivate: repo.data.private,
        defaultBranch: repo.data.default_branch,
        createdByUserId: req.user!.id,
        tokenSource: 'SYSTEM_TOKEN'
      }
    });

    // Eager initial sync: GitHub is source of truth; DB is refreshed snapshot/cache.
    try {
      await syncRepositoryRuns(created.id);
    } catch {
      // keep repository creation successful, but reflect sync error via repository sync fields
    }

    const hydrated = await prisma.repository.findUnique({ where: { id: created.id } });
    return res.status(201).json({ success: true, data: hydrated ?? created });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Repository is already connected' });
    }
    throw error;
  }
});

repositoriesRouter.get('/:repoId', async (req, res) => {
  const repoId = String(req.params.repoId);
  const repo = await prisma.repository.findUnique({ where: { id: repoId } });
  if (!repo) return res.status(404).json({ success: false, message: 'Repository not found' });

  const refresh = String(req.query.refresh || '').toLowerCase() === 'true';
  const staleAfterMs = 5 * 60 * 1000;
  const isStale = !repo.lastSuccessfulSyncAt || Date.now() - repo.lastSuccessfulSyncAt.getTime() > staleAfterMs;

  if (refresh || isStale) {
    syncRepositoryRuns(repoId).catch(() => undefined);
  }

  return res.json({ success: true, data: repo });
});

repositoriesRouter.put('/:repoId', requireRoles('DEVOPS', 'ADMIN'), async (req, res) => {
  const repo = await prisma.repository.update({
    where: { id: String(req.params.repoId) },
    data: { isActive: Boolean(req.body.isActive) }
  });
  res.json({ success: true, data: repo });
});

repositoriesRouter.delete('/:repoId', requireRoles('ADMIN'), async (req, res) => {
  await prisma.repository.delete({ where: { id: String(req.params.repoId) } });
  res.json({ success: true });
});

repositoriesRouter.post('/sync-all', requireRoles('DEVELOPER', 'DEVOPS', 'ADMIN'), async (req, res) => {
  const where = req.user!.role === 'DEVELOPER'
    ? {
        OR: [
          { assignments: { some: { userId: req.user!.id } } },
          { createdByUserId: req.user!.id }
        ]
      }
    : {};

  const repos = await prisma.repository.findMany({ where, select: { id: true, fullName: true } });

  if (!repos.length) {
    return res.status(404).json({ success: false, message: 'No repositories available for sync' });
  }

  const results: Array<{ repositoryId: string; fullName: string; success: boolean; message?: string }> = [];

  for (const repo of repos) {
    try {
      await syncRepositoryRuns(repo.id);
      results.push({ repositoryId: repo.id, fullName: repo.fullName, success: true });
    } catch (error) {
      results.push({
        repositoryId: repo.id,
        fullName: repo.fullName,
        success: false,
        message: error instanceof Error ? error.message : 'Sync failed'
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  return res.json({
    success: failureCount === 0,
    data: {
      total: results.length,
      successCount,
      failureCount,
      results
    },
    message:
      failureCount === 0
        ? `Synced all ${successCount} repositories successfully`
        : `Synced ${successCount}/${results.length} repositories, ${failureCount} failed`
  });
});

repositoriesRouter.post('/:repoId/sync', requireRoles('DEVELOPER', 'DEVOPS', 'ADMIN'), async (req, res) => {
  const repoId = String(req.params.repoId);
  if (req.user!.role === 'DEVELOPER') {
    const allowed = await prisma.repository.findFirst({
      where: {
        id: repoId,
        OR: [{ createdByUserId: req.user!.id }, { assignments: { some: { userId: req.user!.id } } }]
      },
      select: { id: true }
    });

    if (!allowed) return res.status(403).json({ success: false, message: 'No repository access' });
  }

  try {
    const result = await syncRepositoryRuns(repoId);
    return res.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Repository sync failed';
    return res.status(400).json({ success: false, message });
  }
});
