import { Queue, Worker, JobsOptions } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(redisUrl);

const queue = new Queue('dwmas-jobs', { connection });

new Worker(
  'dwmas-jobs',
  async (job) => {
    // basic placeholder processor; extend with retry/delayed/cooldown/alerts
    console.log(`Processing job ${job.name}`, job.data);
  },
  { connection }
);

async function main() {
  console.log('[worker] started with Redis at', redisUrl);
  // Enqueue a noop job to verify the worker is alive
  await queue.add('health-check', { ts: Date.now() }, { attempts: 1 } as JobsOptions);
}

main().catch((err) => {
  console.error('[worker] failed to start', err);
  process.exit(1);
});
