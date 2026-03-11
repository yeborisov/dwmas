import { Router } from 'express';
import { stringify } from 'csv-stringify/sync';
import { prisma } from '../config/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

export const exportRouter = Router();
exportRouter.use(requireAuth, requireRoles('DEVOPS', 'ADMIN'));

exportRouter.get('/workflows.json', async (_req, res) => {
  const rows = await prisma.workflowRun.findMany();
  res.json({ success: true, data: rows });
});

exportRouter.get('/workflows.csv', async (_req, res) => {
  const rows = await prisma.workflowRun.findMany();
  const csv = stringify(rows, { header: true });
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});
