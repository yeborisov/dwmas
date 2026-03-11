import { Octokit } from '@octokit/rest';
import { env } from '../config/env.js';

const octokit = new Octokit(env.GITHUB_API_TOKEN ? { auth: env.GITHUB_API_TOKEN } : {});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? Number((error as { status?: number }).status)
          : undefined;

      // Rate-limit and auth errors are not transient; fail fast with clear guidance.
      if (status === 401 || status === 403) {
        throw error;
      }

      lastError = error;
      await sleep(500 * (i + 1));
    }
  }
  throw lastError;
}

function toFriendlyGithubError(error: unknown): Error {
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: number }).status)
      : undefined;
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

  if (status === 403 && (Number.isFinite(remaining) && remaining === 0 || /rate limit|abuse/i.test(message))) {
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

export const githubService = {
  getRepository: async (owner: string, repo: string) => {
    try {
      return await withRetry(() => octokit.repos.get({ owner, repo }));
    } catch (error) {
      throw toFriendlyGithubError(error);
    }
  },
  listWorkflowRuns: async (owner: string, repo: string) => {
    type RestRun = {
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
    };

    let graphRuns: RestRun[] = [];
    let hasGraphData = false;

    try {
      const graph = await withRetry(() =>
        octokit.graphql<{
          repository: {
            workflowRuns?: {
              nodes: Array<{
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
              }>;
            };
          };
        }>(
          `query($owner: String!, $name: String!, $first: Int!) {
            repository(owner: $owner, name: $name) {
              workflowRuns(first: $first) {
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
          }`,
          { owner, name: repo, first: 100 }
        )
      );

      graphRuns = (graph.repository.workflowRuns?.nodes ?? [])
        .filter((node) => Number.isFinite(node.databaseId))
        .map((node) => ({
          id: node.databaseId,
          name: node.displayTitle ?? 'Unnamed workflow',
          status: node.status ?? 'unknown',
          conclusion: node.conclusion ?? null,
          head_branch: node.headBranch ?? null,
          event: node.event ?? null,
          actor: node.actor?.login ? { login: node.actor.login } : null,
          head_sha: node.headSha ?? null,
          html_url: node.url ?? null,
          logs_url: null,
          run_number: node.runNumber ?? null,
          run_started_at: node.createdAt ?? null,
          updated_at: node.updatedAt ?? null
        }));

      hasGraphData = graphRuns.length > 0;
    } catch {
      hasGraphData = false;
    }

    try {
      if (hasGraphData) {
        // Keep REST for compatibility and logs/jobs URLs, but limit to first 2 pages (200 runs).
        const page1 = await withRetry(() => octokit.actions.listWorkflowRunsForRepo({ owner, repo, per_page: 100, page: 1 }));
        const page2 = await withRetry(() => octokit.actions.listWorkflowRunsForRepo({ owner, repo, per_page: 100, page: 2 }));
        const restRuns = [...page1.data.workflow_runs, ...page2.data.workflow_runs];
        return { data: { workflow_runs: restRuns } };
      }

      const page1 = await withRetry(() => octokit.actions.listWorkflowRunsForRepo({ owner, repo, per_page: 100, page: 1 }));
      const page2 = await withRetry(() => octokit.actions.listWorkflowRunsForRepo({ owner, repo, per_page: 100, page: 2 }));
      const page3 = await withRetry(() => octokit.actions.listWorkflowRunsForRepo({ owner, repo, per_page: 100, page: 3 }));
      const runs = [...page1.data.workflow_runs, ...page2.data.workflow_runs, ...page3.data.workflow_runs];
      return { data: { workflow_runs: runs } };
    } catch (error) {
      throw toFriendlyGithubError(error);
    }
  },
  listJobsForRun: async (owner: string, repo: string, runId: number) => {
    try {
      return await withRetry(() => octokit.actions.listJobsForWorkflowRun({ owner, repo, run_id: runId }));
    } catch (error) {
      throw toFriendlyGithubError(error);
    }
  },
  createIssue: async (owner: string, repo: string, title: string, body: string) => {
    try {
      return await withRetry(() =>
        octokit.issues.create({
          owner,
          repo,
          title,
          body
        })
      );
    } catch (error) {
      throw toFriendlyGithubError(error);
    }
  }
};
