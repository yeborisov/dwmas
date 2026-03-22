# Worker

Background job worker built with [BullMQ](https://docs.bullmq.io/) and Redis. It processes queued jobs (currently a simple health-check placeholder) and is the place to add retries, delays, cooldowns, and alerting for longer-running tasks.

## What it does

- Connects to Redis (`REDIS_URL`) and listens on the `dwmas-jobs` queue.
- Enqueues a tiny `health-check` job on startup to verify connectivity.
- Logs processed jobs to stdout; extend `src/index.ts` with real processors.

## Run locally

```bash
pnpm install
pnpm --filter worker dev   # ts-node-dev, watches src
```

## Build & start (compiled)

```bash
pnpm --filter worker build
pnpm --filter worker start
```

## Docker

The compose service `worker` builds from `apps/worker/Dockerfile` and depends on Redis and the GitHub gateway.

## Environment

- `REDIS_URL` (default `redis://localhost:6379` in code or `redis://redis:6379` in docker-compose)

## Tests

```bash
pnpm --filter worker test
```

## Where to add logic

Implement real processors in `src/index.ts` or split into modules and register them in the `Worker` constructor.
