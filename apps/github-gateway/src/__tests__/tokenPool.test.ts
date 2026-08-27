import { tokenPool } from '../lib/tokenPool';
import { describe, it, expect, beforeAll, vi } from 'vitest';

vi.mock('@octokit/auth-app', () => ({
  createAppAuth: () => async () => ({
    token: 'ghs_mock_app_token',
    expiresAt: new Date(Date.now() + 3600_000).toISOString()
  })
}));

describe('Token Pool', () => {
  beforeAll(async () => {
    await tokenPool.init();
  });

  it('should provide a token with >20% quota', async () => {
    const token = await tokenPool.getToken();
    expect(token).toBeDefined();
    expect(token.remaining / token.limit).toBeGreaterThan(0.2);
  });

  it('should update rate limit info', () => {
  const token = { ...tokenPool.tokens[0] };
    tokenPool.updateRateLimit(token, {
      'x-ratelimit-remaining': '1000',
      'x-ratelimit-limit': '5000',
      'x-ratelimit-reset': `${Math.floor(Date.now() / 1000) + 3600}`,
    });
    expect(token.remaining).toBe(1000);
    expect(token.limit).toBe(5000);
  });
});
