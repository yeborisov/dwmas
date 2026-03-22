# Web (Frontend)

Vite + React (TypeScript) SPA for the DWMAS dashboard. Talks to the API for auth, analytics, issues, repositories, and realtime updates over Socket.IO.

## Scripts

```bash
pnpm install
pnpm --filter @dwmas/web dev      # start dev server on 5173
pnpm --filter @dwmas/web build    # type-check + production build
pnpm --filter @dwmas/web preview  # serve the built app
pnpm --filter @dwmas/web lint     # eslint
pnpm --filter @dwmas/web test     # vitest/unit tests
```

## Environment

Configured via `.env` / `.env.example` in repo root (Vite vars start with `VITE_`). Key ones:

- `VITE_API_URL` (e.g., `http://localhost:3000/api`)
- `VITE_API_WS_URL` (e.g., `http://localhost:3000` for Socket.IO)

## Docker

The compose service `web` builds from `apps/web/Dockerfile` and binds to host port 5174 -> container 5173. It depends on the `api` service.

## Notes

- Routing is under `src/router.tsx` and components under `src/components`/`src/pages`.
- Tailwind/PostCSS configured in `tailwind.config.ts` and `postcss.config.js`.
