import { Router } from 'express';
import { stringify } from 'csv-stringify/sync';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const templateSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  type: z.string().min(2),
  configJson: z.object({
    repositoryIds: z.array(z.string()).optional(),
    dateRangePreset: z.enum(['7d', '30d', '90d', 'custom']).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    status: z.string().optional(),
    conclusion: z.string().optional(),
    branch: z.string().optional(),
    actor: z.string().optional(),
    groupBy: z.enum(['repository', 'branch', 'actor', 'status']).optional(),
    exportFormat: z.enum(['json', 'csv']).optional(),
    includeMetrics: z.array(z.string()).optional()
  })
});

function resolveDateRange(preset?: string, from?: string, to?: string) {
  if (preset === 'custom') {
    return { from: from ? new Date(from) : undefined, to: to ? new Date(to) : undefined };
  }
  const now = new Date();
  if (preset === '7d') return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to: now };
  if (preset === '30d') return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now };
  if (preset === '90d') return { from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), to: now };
  return { from: undefined, to: undefined };
}

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

reportsRouter.get('/templates', async (req, res) => {
  const templates = await prisma.reportTemplate.findMany({
    where: req.user!.role === 'ADMIN' ? undefined : { createdByUserId: req.user!.id },
    orderBy: { updatedAt: 'desc' }
  });
  res.json({ success: true, data: templates });
});

reportsRouter.post('/templates', requireRoles('DEVOPS', 'ADMIN'), async (req, res) => {
  const parsed = templateSchema.parse(req.body);
  const template = await prisma.reportTemplate.create({
    data: {
      name: parsed.name,
      description: parsed.description,
      type: parsed.type,
      configJson: parsed.configJson,
      createdByUserId: req.user!.id
    }
  });
  res.status(201).json({ success: true, data: template });
});

reportsRouter.put('/templates/:templateId', requireRoles('DEVOPS', 'ADMIN'), async (req, res) => {
  const templateId = String(req.params.templateId);
  const parsed = templateSchema.partial().parse(req.body);
  const existing = await prisma.reportTemplate.findUnique({ where: { id: templateId } });
  if (!existing) return res.status(404).json({ success: false, message: 'Template not found' });

  if (req.user!.role !== 'ADMIN' && existing.createdByUserId !== req.user!.id) {
    return res.status(403).json({ success: false, message: 'Only template owner or admin can edit this template' });
  }

  const updated = await prisma.reportTemplate.update({
    where: { id: templateId },
    data: {
      name: parsed.name,
      description: parsed.description,
      type: parsed.type,
      configJson: parsed.configJson
    }
  });

  return res.json({ success: true, data: updated });
});

reportsRouter.delete('/templates/:templateId', requireRoles('DEVOPS', 'ADMIN'), async (req, res) => {
  const templateId = String(req.params.templateId);
  const existing = await prisma.reportTemplate.findUnique({ where: { id: templateId } });
  if (!existing) return res.status(404).json({ success: false, message: 'Template not found' });

  if (req.user!.role !== 'ADMIN' && existing.createdByUserId !== req.user!.id) {
    return res.status(403).json({ success: false, message: 'Only template owner or admin can delete this template' });
  }

  await prisma.reportTemplate.delete({ where: { id: templateId } });
  return res.json({ success: true });
});

reportsRouter.post('/templates/:templateId/apply', async (req, res) => {
  const template = await prisma.reportTemplate.findUnique({ where: { id: String(req.params.templateId) } });
  if (!template) return res.status(404).json({ success: false, message: 'Template not found' });

  const config = (template.configJson ?? {}) as Record<string, unknown>;
  const repositoryIds = Array.isArray(config.repositoryIds) ? (config.repositoryIds as string[]) : undefined;
  const status = typeof config.status === 'string' ? config.status : undefined;
  const conclusion = typeof config.conclusion === 'string' ? config.conclusion : undefined;
  const branch = typeof config.branch === 'string' ? config.branch : undefined;
  const actor = typeof config.actor === 'string' ? config.actor : undefined;
  const range = resolveDateRange(
    typeof config.dateRangePreset === 'string' ? config.dateRangePreset : undefined,
    typeof config.from === 'string' ? config.from : undefined,
    typeof config.to === 'string' ? config.to : undefined
  );

  const rows = await prisma.workflowRun.findMany({
    where: {
      repositoryId: repositoryIds?.length ? { in: repositoryIds } : undefined,
      status,
      conclusion,
      branch,
      actor,
      startedAt: range.from || range.to ? { gte: range.from, lte: range.to } : undefined
    },
    include: { repository: true },
    orderBy: { startedAt: 'desc' },
    take: 1000
  });

  const response = {
    template,
    summary: {
      totalRuns: rows.length,
      failedRuns: rows.filter((r: typeof rows[number]) => r.conclusion === 'failure').length,
      successfulRuns: rows.filter((r: typeof rows[number]) => r.conclusion === 'success').length
    },
    rows
  };

  return res.json({ success: true, data: response });
});

reportsRouter.get('/templates/:templateId/export.csv', requireRoles('DEVOPS', 'ADMIN'), async (req, res) => {
  const template = await prisma.reportTemplate.findUnique({ where: { id: String(req.params.templateId) } });
  if (!template) return res.status(404).json({ success: false, message: 'Template not found' });

  const config = (template.configJson ?? {}) as Record<string, unknown>;
  const repositoryIds = Array.isArray(config.repositoryIds) ? (config.repositoryIds as string[]) : undefined;
  const rows = await prisma.workflowRun.findMany({
    where: { repositoryId: repositoryIds?.length ? { in: repositoryIds } : undefined },
    include: { repository: true },
    orderBy: { startedAt: 'desc' },
    take: 1000
  });

  const csv = stringify(
    rows.map((row: typeof rows[number]) => ({
      repository: row.repository.fullName,
      workflowName: row.workflowName,
      status: row.status,
      conclusion: row.conclusion,
      branch: row.branch,
      actor: row.actor,
      startedAt: row.startedAt?.toISOString(),
      durationMs: row.durationMs
    })),
    { header: true }
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${template.name.replace(/\s+/g, '-').toLowerCase()}.csv"`);
  return res.send(csv);
});