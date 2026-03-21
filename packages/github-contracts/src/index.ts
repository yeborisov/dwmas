// Shared types/interfaces for GitHub API Gateway

export interface GitHubToken {
  type: 'app' | 'pat';
  token: string;
  expiresAt?: string;
  remaining: number;
  limit: number;
  reset: number;
  note?: string;
}

export interface GitHubApiRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface GitHubApiResponse {
  status: number;
  headers: Record<string, string>;
  data: any;
}

export interface CacheInvalidateRequest {
  prefix?: string;
  key?: string;
}

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: number;
}
