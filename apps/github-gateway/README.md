# GitHub Gateway

Express-based proxy that fronts GitHub API calls, pools tokens (GitHub App + PATs), and caches GET responses in Redis. Exposes metrics and health endpoints for observability.

## What it does

- Proxies requests under `/api/github/*` to GitHub with pooled tokens and rate-limit awareness.
- Caches GET responses in Redis for `CACHE_TTL_SECONDS`.
- Exposes `/metrics` (Prometheus) and `/health`.

## Scripts

```bash
pnpm install
pnpm --filter github-gateway dev    # ts-node-dev
pnpm --filter github-gateway build  # tsc
pnpm --filter github-gateway start  # runs dist/index.js
pnpm --filter github-gateway test   # vitest
```

## Environment

Set via `.env` / `.env.example` (used by docker-compose too):

- `REDIS_URL`
- `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`
- `GITHUB_PAT_POOL` (comma-separated PATs)
- `GITHUB_API_URL` (defaults to `https://api.github.com`)
- `CACHE_TTL_SECONDS`

## Docker

The compose service `github-gateway` builds from `apps/github-gateway/Dockerfile`, binds host 4400 → container 4000, and depends on Redis.

## Notes

- Main entry: `src/index.ts`; proxy logic in `src/services/githubService.ts`; caching in `src/services/cacheService.ts`; token pool in `src/lib/tokenPool.ts`.
