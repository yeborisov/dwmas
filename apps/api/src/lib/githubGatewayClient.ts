import axios from 'axios';
import { GitHubApiRequest, GitHubApiResponse } from '@dwmas/github-contracts';

const GITHUB_GATEWAY_URL = process.env.GITHUB_GATEWAY_URL || 'http://localhost:4000';

export async function callGitHubApi(req: GitHubApiRequest): Promise<GitHubApiResponse> {
  const { method, url, headers, body } = req;
  const response = await axios({
    method,
    url: `${GITHUB_GATEWAY_URL}/api/github${url}`,
    headers,
    data: body,
    validateStatus: () => true,
  });
  const normalizedHeaders = Object.fromEntries(
    Object.entries(response.headers).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)])
  );
  return {
    status: response.status,
    headers: normalizedHeaders,
    data: response.data,
  };
}
