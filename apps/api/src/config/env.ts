import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// Load .env from project root (../../.env relative to apps/api/src/config/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(__dirname, '..', '..', '..', '..', '.env');
dotenv.config({ path: rootEnv });
// Also try CWD as fallback
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().url(),
  CORS_ORIGIN: z.string().url(),
  SESSION_SECRET: z.string().min(10),
  JWT_SECRET: z.string().min(10),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_CALLBACK_URL: z.string().url(),
  GITHUB_API_TOKEN: z.string().optional(),
  ADMIN_GITHUB_IDS: z.string().optional(),
  ADMIN_GITHUB_USERNAMES: z.string().optional(),
  DEVOPS_GITHUB_IDS: z.string().optional(),
  DEVOPS_GITHUB_USERNAMES: z.string().optional(),
  GITHUB_CACHE_TTL_MS: z.coerce.number().optional()
});

export const env = envSchema.parse(process.env);
