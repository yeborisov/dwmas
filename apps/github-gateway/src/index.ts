import express from 'express';
import { env } from './config/env';
import { metricsRouter } from './routes/metrics';
import { healthRouter } from './routes/health';
import { githubApiRouter } from './routes/github';
import { cacheRouter } from './routes/cache';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './lib/logger';

const app = express();
app.use(express.json());

app.use('/metrics', metricsRouter);
app.use('/health', healthRouter);
app.use('/api/github', githubApiRouter);
app.use('/cache', cacheRouter);

app.use(errorHandler);

const port = 4000;
app.listen(port, () => {
  logger.info(`GitHub Gateway listening on port ${port}`);
});
