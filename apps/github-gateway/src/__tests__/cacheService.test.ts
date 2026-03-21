import { cacheService } from '../services/cacheService';
import { describe, it, expect, beforeAll } from 'vitest';

const key = 'test-key';
const value = 'test-value';

describe('Cache Service', () => {
  beforeAll(async () => {
    await cacheService.invalidateAll();
  });

  it('should set and get cache', async () => {
    await cacheService.set(key, value, 10);
    const cached = await cacheService.get(key);
    expect(cached).toBe(value);
  });

  it('should invalidate prefix', async () => {
    await cacheService.set('prefix:1', value, 10);
    await cacheService.invalidatePrefix('prefix:');
    const cached = await cacheService.get('prefix:1');
    expect(cached).toBeNull();
  });
});
