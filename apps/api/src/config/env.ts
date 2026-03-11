import dotenv from 'dotenv';
import { z } from 'zod';

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
  DEVOPS_GITHUB_USERNAMES: z.string().optional()
});

export const env = envSchema.parse(process.env);
