import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';
import { env } from '../config/env';
import { GitHubToken, RateLimitInfo } from '@dwmas/github-contracts';
import { logger } from './logger';

const PAT_POOL = env.GITHUB_PAT_POOL.split(',').map(s => s.trim()).filter(Boolean);

let tokens: GitHubToken[] = [];

async function initAppToken(): Promise<GitHubToken> {
  const auth = createAppAuth({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    clientId: env.GITHUB_APP_CLIENT_ID,
    clientSecret: env.GITHUB_APP_CLIENT_SECRET,
  });
  const { token, expiresAt } = await auth({ type: 'app' });
  return {
    type: 'app',
    token,
    expiresAt,
    remaining: 5000,
    limit: 5000,
    reset: Date.now() / 1000 + 3600,
  };
}

function patTokens(): GitHubToken[] {
  return PAT_POOL.map(token => ({
    type: 'pat',
    token,
    remaining: 5000,
    limit: 5000,
    reset: Date.now() / 1000 + 3600,
  }));
}

export const tokenPool = {
  async init() {
    tokens = [await initAppToken(), ...patTokens()];
  },
  async getToken(): Promise<GitHubToken> {
    if (!tokens.length) await this.init();
    // Proactive switch: below 20% remaining
    let available = tokens.filter(t => t.remaining / t.limit > 0.2);
    if (!available.length) {
      logger.warn('All tokens near exhaustion, using queue/backoff');
      // TODO: implement queue/backoff logic
      available = tokens;
    }
    // Pick the token with most remaining
    return available.sort((a, b) => b.remaining - a.remaining)[0];
  },
  updateRateLimit(token: GitHubToken, headers: any) {
    if (headers['x-ratelimit-remaining']) {
      token.remaining = parseInt(headers['x-ratelimit-remaining']);
      token.limit = parseInt(headers['x-ratelimit-limit']);
      token.reset = parseInt(headers['x-ratelimit-reset']);
    }
  },
  get tokens(): GitHubToken[] {
    return tokens;
  },
};
