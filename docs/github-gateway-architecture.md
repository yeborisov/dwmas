# GitHub Gateway Architecture

## Overview
The GitHub Gateway is an internal API gateway for all GitHub API traffic. It centralizes authentication, caching, rate limit management, and observability for all outbound GitHub requests from the monorepo.

## Key Features
- Token rotation pool (GitHub App + PAT fallback)
- Proactive token switching below 20% quota
- Redis cache for GET requests (configurable TTL)
- Manual cache invalidation endpoints
- Request queueing and exponential backoff on rate limits
- Per-token rate limit tracking
- Prometheus metrics and alert hooks

## Endpoints
- `GET /health` — Health check
- `GET /metrics` — Prometheus metrics
- `ANY /api/github/*` — Proxy to GitHub API
- `DELETE /cache` — Invalidate all cache
- `DELETE /cache/prefix` — Invalidate cache by prefix

## Integration
- `api` and `worker` call the gateway for all GitHub API needs
- `web` never calls GitHub directly

## Token Pool
- Uses GitHub App authentication as primary
- Fallback to PAT pool if needed
- Tracks X-RateLimit-* headers per token
- Switches tokens proactively

## Caching
- Only GET requests are cached
- TTL configurable (default 60s)
- No cache for mutating requests

## Observability
- Structured logging (winston/pino)
- Prometheus metrics
- Alert hooks for Teams/ServiceNow
