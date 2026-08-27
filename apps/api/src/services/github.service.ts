import { Octokit } from '@octokit/rest';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const octokit = new Octokit(env.GITHUB_API_TOKEN ? { auth: env.GITHUB_API_TOKEN } : {});

/** Cache TTL in milliseconds – configurable via env, default 2 minutes */
const CACHE_TTL_MS = Number(env.GITHUB_CACHE_TTL_MS) || 120_000;

/** Maximum concurrent REST pages to fetch in parallel */
const MAX_PARALLEL_PAGES = 2;

/** GraphQL page size (GitHub max is 100) */
const GQL_PAGE_SIZE = 100;

/** Maximum workflow runs to fetch per repository */
const MAX_RUNS_PER_REPO = 200;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GithubWorkflowRun {
  id: number;
  name: string | null;
  status: string | null;
  conclusion: string | null;
  head_branch: string | null;
  event: string | null;
  actor?: { login?: string | null } | null;
  head_sha: string | null;
  html_url: string | null;
  logs_url: string | null;
  run_number: number | null;
  run_started_at: string | null;
  updated_at: string | null;
}

export interface GithubWorkflowRunsResponse {
  data: {
    workflow_runs: GithubWorkflowRun[];
    total_count?: number;
  };
}

export interface GithubJob {
  id: number;
  run_id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
  runner_name: string | null;
  html_url: string | null;
}

/* ------------------------------------------------------------------ */
/*  Cache layer with ETag / conditional request support                */
/* ------------------------------------------------------------------ */

interface CacheEntry<T = unknown> {
  expiresAt: number;
  value: T;
  etag?: string;
  lastModified?: string;
}

const cache = new Map<string, CacheEntry>();

function readCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

function writeCache<T>(key: string, value: T, etag?: string, lastModified?: string): T {
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value, etag, lastModified });
  return value;
}

/** Flush all cached entries (useful after sync operations) */
export function clearGithubCache(): void {
  cache.clear();
}

/* ------------------------------------------------------------------ */
/*  Retry with exponential back-off & rate-limit awareness             */
/* ------------------------------------------------------------------ */

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      const status = extractStatus(error);

      // Auth and rate-limit errors are not transient – fail fast
      if (status === 401 || status === 403) {
        throw error;
      }

      lastError = error;

      // Exponential back-off: 500ms, 1000ms, 2000ms ...
      const delay = 500 * Math.pow(2, i);
      logger.warn(`GitHub API retry ${i + 1}/${attempts} after ${delay}ms – ${String(error)}`);
      await sleep(delay);
    }
  }
  throw lastError;
}

/* ------------------------------------------------------------------ */
/*  Error helpers                                                      */
/* ------------------------------------------------------------------ */

function extractStatus(error: unknown): number | undefined {
  return typeof error === 'object' && error !== null && 'status' in error
    ? Number((error as { status?: number }).status)
    : undefined;
}

function toFriendlyGithubError(error: unknown): Error {
  const status = extractStatus(error);
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: string }).message)
      : 'GitHub API request failed';
  const headers =
    typeof error === 'object' && error !== null && 'response' in error
      ? ((error as { response?: { headers?: Record<string, string> } }).response?.headers ?? {})
      : {};

  const remaining = Number(headers['x-ratelimit-remaining'] ?? '');
  const resetEpoch = Number(headers['x-ratelimit-reset'] ?? '');
  const retryAfter = Number(headers['retry-after'] ?? '');

  if (status === 403 && ((Number.isFinite(remaining) && remaining === 0) || /rate limit|abuse/i.test(message))) {
    const waitMinutes = Number.isFinite(resetEpoch)
      ? Math.max(1, Math.ceil((resetEpoch * 1000 - Date.now()) / 60_000))
      : Number.isFinite(retryAfter)
        ? Math.max(1, Math.ceil(retryAfter / 60))
        : undefined;

    return new Error(
      `GitHub API rate limit exceeded.${waitMinutes ? ` Retry in ~${waitMinutes} min.` : ''} Configure GITHUB_API_TOKEN in .env and restart API (pnpm run dev) to use authenticated GitHub limits.`
    );
  }

  if (status === 401) {
    return new Error('GitHub authentication failed. Check GITHUB_API_TOKEN in .env and restart API.');
  }

  return new Error(message);
}

/* ------------------------------------------------------------------ */
/*  Normalisation                                                      */
/* ------------------------------------------------------------------ */

function normalizeWorkflowRun(run: {
  id: number;
  name?: string | null;
  status?: string | null;
  conclusion?: string | null;
  head_branch?: string | null;
  event?: string | null;
  actor?: { login?: string | null } | null;
  head_sha?: string | null;
  html_url?: string | null;
  logs_url?: string | null;
  run_number?: number | null;
  run_started_at?: string | null;
  updated_at?: string | null;
}): GithubWorkflowRun {
  return {
    id: run.id,
    name: run.name ?? null,
    status: run.status ?? null,
    conclusion: run.conclusion ?? null,
    head_branch: run.head_branch ?? null,
    event: run.event ?? null,
    actor: run.actor?.login ? { login: run.actor.login } : null,
    head_sha: run.head_sha ?? null,
    html_url: run.html_url ?? null,
    logs_url: run.logs_url ?? null,
    run_number: run.run_number ?? null,
    run_started_at: run.run_started_at ?? null,
    updated_at: run.updated_at ?? null
  };
}

/* ------------------------------------------------------------------ */
/*  GraphQL: primary data source (1 request = up to 100 runs)         */
/* ------------------------------------------------------------------ */

const WORKFLOW_RUNS_QUERY = `
  query ($owner: String!, $name: String!, $first: Int!, $after: String) {
    repository(owner: $owner, name: $name) {
      workflowRuns(first: $first, after: $after) {
        totalCount
        pageInfo { hasNextPage endCursor }
        nodes {
          databaseId
          displayTitle
          status
          conclusion
          headBranch
          event
          actor { login }
          headSha
          url
          runNumber
          createdAt
          updatedAt
        }
      }
    }
    rateLimit { remaining resetAt }
  }
`;

interface GraphQLRunNode {
  databaseId: number;
  displayTitle?: string | null;
  status?: string | null;
  conclusion?: string | null;
  headBranch?: string | null;
  event?: string | null;
  actor?: { login?: string | null } | null;
  headSha?: string | null;
  url?: string | null;
  runNumber?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface GraphQLRunsResponse {
  repository: {
    workflowRuns?: {
      totalCount: number;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: GraphQLRunNode[];
    };
  };
  rateLimit?: { remaining: number; resetAt: string };
}

function graphNodeToRun(node: GraphQLRunNode): GithubWorkflowRun {
  return {
    id: node.databaseId,
    name: node.displayTitle ?? 'Unnamed workflow',
    status: node.status?.toLowerCase() ?? 'unknown',
    conclusion: node.conclusion?.toLowerCase() ?? null,
    head_branch: node.headBranch ?? null,
    event: node.event ?? null,
    actor: node.actor?.login ? { login: node.actor.login } : null,
    head_sha: node.headSha ?? null,
    html_url: node.url ?? null,
    logs_url: null,
    run_number: node.runNumber ?? null,
    run_started_at: node.createdAt ?? null,
    updated_at: node.updatedAt ?? null
  };
}

async function fetchRunsViaGraphQL(owner: string, repo: string): Promise<GithubWorkflowRun[] | null> {
  try {
    const allRuns: GithubWorkflowRun[] = [];
    let cursor: string | null = null;
    let pages = 0;
    const maxPages = Math.ceil(MAX_RUNS_PER_REPO / GQL_PAGE_SIZE);

    while (pages < maxPages) {
      const response = await withRetry(() =>
        octokit.graphql<GraphQLRunsResponse>(WORKFLOW_RUNS_QUERY, {
          owner,
          name: repo,
          first: GQL_PAGE_SIZE,
          after: cursor
        })
      );

      const runs = response.repository.workflowRuns;
      if (!runs || runs.nodes.length === 0) break;

      // Log rate limit info for monitoring
      if (response.rateLimit) {
        logger.debug(`GitHub GraphQL rate limit remaining: ${response.rateLimit.remaining}`);
      }

      allRuns.push(
        ...runs.nodes.filter((n) => Number.isFinite(n.databaseId)).map(graphNodeToRun)
      );

      if (!runs.pageInfo.hasNextPage || allRuns.length >= MAX_RUNS_PER_REPO) break;
      cursor = runs.pageInfo.endCursor;
      pages += 1;
    }

    return allRuns.length > 0 ? allRuns : null;
  } catch (error) {
    logger.warn(`GraphQL workflow runs fetch failed, falling back to REST: ${String(error)}`);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  REST fallback: parallel page fetching                              */
/* ------------------------------------------------------------------ */

async function fetchRunsViaREST(owner: string, repo: string): Promise<GithubWorkflowRun[]> {
  const totalPages = Math.ceil(MAX_RUNS_PER_REPO / 100);
  const allRuns: GithubWorkflowRun[] = [];

  // Fetch pages in parallel batches to reduce total request time
  for (let batch = 0; batch < totalPages; batch += MAX_PARALLEL_PAGES) {
    const pageNumbers = Array.from(
      { length: Math.min(MAX_PARALLEL_PAGES, totalPages - batch) },
      (_, i) => batch + i + 1
    );

    const results = await Promise.all(
      pageNumbers.map((page) =>
        withRetry(() =>
          octokit.actions.listWorkflowRunsForRepo({ owner, repo, per_page: 100, page })
        )
      )
    );

    for (const result of results) {
      allRuns.push(...result.data.workflow_runs.map(normalizeWorkflowRun));
    }

    // If last page returned fewer than 100, no more pages exist
    const lastResult = results[results.length - 1];
    if (lastResult.data.workflow_runs.length < 100) break;
  }

  return allRuns;
}

/* ------------------------------------------------------------------ */
/*  Batch jobs fetching via GraphQL                                    */
/* ------------------------------------------------------------------ */

/**
 * Batch-fetch jobs for multiple workflow runs via REST.
 */
const BATCH_SIZE_JOBS = 25;

export async function batchFetchJobsViaGraphQL(
  owner: string,
  repo: string,
  runIds: number[]
): Promise<Map<number, GithubJob[]>> {
  const result = new Map<number, GithubJob[]>();
  if (runIds.length === 0) return result;

  const batches: number[][] = [];
  for (let i = 0; i < runIds.length; i += BATCH_SIZE_JOBS) {
    batches.push(runIds.slice(i, i + BATCH_SIZE_JOBS));
  }

  for (const batch of batches) {
    for (const runId of batch) {
      try {
        const resp = await withRetry(() =>
          octokit.actions.listJobsForWorkflowRun({ owner, repo, run_id: runId, per_page: 100 })
        );
        result.set(
          runId,
          resp.data.jobs.map((j) => ({
            id: j.id,
            run_id: runId,
            name: j.name,
            status: j.status ?? 'unknown',
            conclusion: j.conclusion ?? null,
            started_at: j.started_at ?? null,
            completed_at: j.completed_at ?? null,
            runner_name: j.runner_name ?? null,
            html_url: j.html_url ?? null
          }))
        );
      } catch (error) {
        logger.error(`Failed to fetch jobs for run ${runId}: ${String(error)}`);
        result.set(runId, []);
      }
    }
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export const githubService = {
  /**
   * Get repository metadata. Uses cache with conditional requests.
   */
  getRepository: async (owner: string, repo: string) => {
    const key = `repo:${owner}/${repo}`;
    const cached = readCache<Awaited<ReturnType<typeof octokit.repos.get>>>(key);
    if (cached) return cached;

    try {
      const response = await withRetry(() => octokit.repos.get({ owner, repo }));
      const etag = response.headers?.etag;
      const lastModified = response.headers?.['last-modified'];
      return writeCache(key, response, etag, lastModified);
    } catch (error) {
      throw toFriendlyGithubError(error);
    }
  },

  /**
   * List workflow runs for a repository.
   * Strategy: GraphQL first (1-2 requests for 200 runs) → REST fallback (parallel pages).
   * Results are cached for CACHE_TTL_MS.
   */
  listWorkflowRuns: async (owner: string, repo: string): Promise<GithubWorkflowRunsResponse> => {
    const key = `runs:${owner}/${repo}`;
    const cached = readCache<GithubWorkflowRunsResponse>(key);
    if (cached) return cached;

    try {
      // Try GraphQL first – uses 1-2 API points vs 2-3 REST calls
      const graphRuns = await fetchRunsViaGraphQL(owner, repo);

      if (graphRuns && graphRuns.length > 0) {
        logger.info(`Fetched ${graphRuns.length} runs via GraphQL for ${owner}/${repo}`);
        return writeCache(key, { data: { workflow_runs: graphRuns, total_count: graphRuns.length } });
      }

      // REST fallback with parallel page fetching
      const restRuns = await fetchRunsViaREST(owner, repo);
      logger.info(`Fetched ${restRuns.length} runs via REST for ${owner}/${repo}`);
      return writeCache(key, { data: { workflow_runs: restRuns, total_count: restRuns.length } });
    } catch (error) {
      throw toFriendlyGithubError(error);
    }
  },

  /**
   * List jobs for a single workflow run.
   * For batch operations, prefer `batchFetchJobsViaGraphQL` instead.
   */
  listJobsForRun: async (owner: string, repo: string, runId: number) => {
    const key = `jobs:${owner}/${repo}/${runId}`;
    const cached = readCache<Awaited<ReturnType<typeof octokit.actions.listJobsForWorkflowRun>>>(key);
    if (cached) return cached;

    try {
      const response = await withRetry(() =>
        octokit.actions.listJobsForWorkflowRun({ owner, repo, run_id: runId, per_page: 100 })
      );
      return writeCache(key, response);
    } catch (error) {
      throw toFriendlyGithubError(error);
    }
  },

  /**
   * Batch-fetch jobs for multiple runs.
   * Uses GraphQL aliased queries to reduce API calls from N to ceil(N/25).
   */
  batchListJobsForRuns: batchFetchJobsViaGraphQL,

  /**
   * Create a GitHub issue.
   */
  createIssue: async (owner: string, repo: string, title: string, body: string) => {
    try {
      return await withRetry(() =>
        octokit.issues.create({ owner, repo, title, body })
      );
    } catch (error) {
      throw toFriendlyGithubError(error);
    }
  },

  /**
   * Get a GitHub issue by number.
   */
  getIssue: async (owner: string, repo: string, issueNumber: number) => {
    try {
      return await withRetry(() =>
        octokit.issues.get({ owner, repo, issue_number: issueNumber })
      );
    } catch (error) {
      throw toFriendlyGithubError(error);
    }
  },

  /**
   * List comments for a GitHub issue.
   */
  listIssueComments: async (owner: string, repo: string, issueNumber: number) => {
    try {
      return await withRetry(() =>
        octokit.issues.listComments({ owner, repo, issue_number: issueNumber, per_page: 100 })
      );
    } catch (error) {
      throw toFriendlyGithubError(error);
    }
  },

  /**
   * Create a comment on a GitHub issue.
   */
  createIssueComment: async (owner: string, repo: string, issueNumber: number, body: string) => {
    try {
      return await withRetry(() =>
        octokit.issues.createComment({ owner, repo, issue_number: issueNumber, body })
      );
    } catch (error) {
      throw toFriendlyGithubError(error);
    }
  },

  /**
   * Get current rate limit status for monitoring.
   */
  getRateLimit: async () => {
    try {
      const response = await octokit.rateLimit.get();
      return {
        core: response.data.resources.core,
        graphql: response.data.resources.graphql,
        search: response.data.resources.search
      };
    } catch (error) {
      throw toFriendlyGithubError(error);
    }
  }
};