import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('auth guards', () => {
  it('rejects /api/me without cookie', async () => {
    const app = createApp();
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
