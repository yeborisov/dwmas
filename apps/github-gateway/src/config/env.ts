import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  REDIS_URL: z.string().url(),
  GITHUB_APP_ID: z.string(),
  GITHUB_APP_PRIVATE_KEY: z.string(),
  GITHUB_APP_CLIENT_ID: z.string(),
  GITHUB_APP_CLIENT_SECRET: z.string(),
  GITHUB_PAT_POOL: z.string(),
  GITHUB_API_URL: z.string().url().default('https://api.github.com'),
  CACHE_TTL_SECONDS: z.coerce.number().default(60),
  QUEUE_PREFIX: z.string().default('dwmas'),
});

export const env = envSchema.parse(process.env);
