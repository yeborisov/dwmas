import Redis from 'ioredis';
import { env } from '../config/env';

const redis = new Redis(env.REDIS_URL);

export const cacheService = {
  async get(key: string) {
    return redis.get(key);
  },
  async set(key: string, value: string, ttl: number) {
    await redis.set(key, value, 'EX', ttl);
  },
  async invalidateAll() {
    await redis.flushdb();
  },
  async invalidatePrefix(prefix: string) {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length) await redis.del(...keys);
  },
};
