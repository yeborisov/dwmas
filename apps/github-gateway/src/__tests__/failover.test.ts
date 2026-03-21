import { tokenPool } from '../lib/tokenPool';
import { describe, it, expect, beforeAll } from 'vitest';

describe('Token Pool Failover', () => {
  beforeAll(async () => {
    await tokenPool.init();
    // Exhaust all but one token
    tokenPool.tokens.forEach((token, index) => {
      if (index !== 0) token.remaining = 0;
    });
  });

  it('should failover to available token', async () => {
    const token = await tokenPool.getToken();
    expect(token.remaining).toBeGreaterThan(0);
  });
});
