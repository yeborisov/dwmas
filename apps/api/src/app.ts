import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type RequestHandler } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { passport } from './config/passport.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { commentsRouter } from './routes/comments.routes.js';
import { exportRouter } from './routes/export.routes.js';
import { issuesRouter } from './routes/issues.routes.js';
import { repositoriesRouter } from './routes/repositories.routes.js';
import { reportsRouter } from './routes/reports.routes.js';
import { systemRouter } from './routes/system.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { workflowsRouter } from './routes/workflows.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/auth.js';

export function createApp() {
  const app = express();
  const allowedOrigins = new Set(
    [env.CORS_ORIGIN, env.APP_URL]
      .flatMap((value) => value.split(','))
      .map((origin) => origin.trim())
      .filter(Boolean)
  );

  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(
    cors({
      origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  const authRateLimiter = rateLimit({ windowMs: 60_000, max: 20 }) as unknown as RequestHandler;
  app.use('/api/auth', authRateLimiter, authRouter);
  app.get('/api/me', requireAuth, (req, res) => res.json({ success: true, data: req.user }));
  app.post('/api/logout', (_req, res) => {
    res.clearCookie('dwmas_token');
    res.json({ success: true });
  });
  app.use('/api/users', usersRouter);
  app.use('/api/repositories', repositoriesRouter);
  app.use('/api/workflows', workflowsRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api', issuesRouter);
  app.use('/api', commentsRouter);
  app.use('/api/export', exportRouter);
  app.use('/api', systemRouter);

  app.use(errorHandler);
  return app;
}
