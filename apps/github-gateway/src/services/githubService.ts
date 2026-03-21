import axios, { AxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { tokenPool } from '../lib/tokenPool';
import { cacheService } from './cacheService';
import { logger } from '../lib/logger';
import { RateLimitInfo } from '@dwmas/github-contracts';

const GITHUB_API_URL = env.GITHUB_API_URL;
const CACHE_TTL = env.CACHE_TTL_SECONDS;

export const githubService = {
  async proxyRequest(req: any) {
    const method = req.method;
    const url = `${GITHUB_API_URL}${req.path}`;
    const headers = { ...req.headers };
    let token = await tokenPool.getToken();
    headers['authorization'] = `Bearer ${token.token}`;
    const cacheKey = `gh:${method}:${url}:${JSON.stringify(req.query || {})}`;

    // Only cache GET
    if (method === 'GET') {
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.info('Cache hit', { url });
        return JSON.parse(cached);
      }
    }

    try {
      const config: AxiosRequestConfig = { method, url, headers, data: req.body };
      const response = await axios(config);
      const result = {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
      if (method === 'GET') {
        await cacheService.set(cacheKey, JSON.stringify(result), CACHE_TTL);
      }
      tokenPool.updateRateLimit(token, response.headers);
      return result;
    } catch (err: any) {
      logger.error('GitHub API error', { error: err.message });
      throw err;
    }
  },
};
