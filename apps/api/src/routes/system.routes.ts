import { Router } from 'express';

export const systemRouter = Router();

systemRouter.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'dwmas-api', timestamp: new Date().toISOString() } });
});

systemRouter.get('/docs', (_req, res) => {
  res.json({
    success: true,
    data: {
      openapi: '3.0.0',
      info: { title: 'DWMAS API', version: '1.0.0' },
      paths: {
        '/api/auth/github': { get: { summary: 'Start GitHub OAuth login' } },
        '/api/workflows': { get: { summary: 'List workflow runs with filters' } },
        '/api/analytics/summary': { get: { summary: 'KPI summary' } },
        '/api/reports/templates': { get: { summary: 'List report templates' }, post: { summary: 'Create report template' } },
        '/api/reports/templates/{templateId}/apply': { post: { summary: 'Apply report template to workflow data' } }
      }
    }
  });
});
