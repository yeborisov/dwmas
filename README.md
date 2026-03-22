# DevOps Workflow Monitoring & Analytics System (DWMAS)

Production-ready university course monorepo starter for centralized GitHub Actions monitoring and analytics.

## Course & Author

- **Course:** Full stack Application Development with Node.js + Express.js + React.js - 2026
- **Author:** Yordan B.
- **FN:** 9MI3400735

## Overview

DWMAS centralizes workflow execution data across repositories, provides role-based access control, realtime monitoring, analytics, local issues/comments, and export/reporting.

Key highlights:
- GitHub OAuth-only authentication (no local email/password auth)
- Automatic local user creation on first OAuth login
- Default first role: `DEVELOPER` (admin bootstrap through env allow-list)
- PostgreSQL + Prisma persistence
- REST API with validation and RBAC middleware
- Realtime updates via SSE and Socket.IO
- SPA frontend with protected routes and role-aware navigation

## Monorepo Structure

```text
dwmas/
  apps/
    api/                # Express + TypeScript backend (REST, RBAC, Prisma, realtime)
    web/                # React + Vite + TypeScript SPA dashboard
    github-gateway/     # Express reverse proxy: token pool, Redis cache, GitHub API proxy
    worker/             # BullMQ background job worker (repo sync, analytics)
  packages/
    shared/             # Shared constants, types, and utilities
    github-contracts/   # Typed contracts for GitHub Gateway ↔ API communication
  prisma/
    schema.prisma       # Canonical Prisma schema (source of truth)
    README.md           # Schema docs, ERD, migration workflow
  docs/
    architecture.md           # System architecture + Mermaid diagrams
    oauth-sequence.md         # GitHub OAuth login sequence
    workflow-sync-sequence.md # Workflow sync sequence
  docker-compose.yml
  pnpm-workspace.yaml
  .env.example
  LICENSE
  README.md
```

### Service READMEs

| Service / Package         | README                                                                    |
|---------------------------|---------------------------------------------------------------------------|
| API (backend)             | `apps/api/` — see root README sections below                             |
| Web (frontend SPA)        | [`apps/web/README.md`](apps/web/README.md)                               |
| GitHub Gateway            | [`apps/github-gateway/README.md`](apps/github-gateway/README.md)         |
| Worker                    | [`apps/worker/README.md`](apps/worker/README.md)                         |
| Prisma schema             | [`prisma/README.md`](prisma/README.md)                                   |
| Architecture & diagrams   | [`docs/architecture.md`](docs/architecture.md)                           |
| OAuth sequence            | [`docs/oauth-sequence.md`](docs/oauth-sequence.md)                       |
| Workflow sync sequence    | [`docs/workflow-sync-sequence.md`](docs/workflow-sync-sequence.md)       |

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, React Router, TanStack Query, Zustand, Tailwind CSS, Recharts
- **Backend:** Node.js, Express, TypeScript
- **ORM/DB:** Prisma + PostgreSQL
- **Auth:** GitHub OAuth (Passport GitHub strategy), httpOnly cookie token
- **Validation:** Zod
- **Logging:** Pino
- **Realtime:** SSE + Socket.IO
- **GitHub Integration:** Octokit
- **Testing:** Vitest, Supertest, React Testing Library
- **Quality:** ESLint + Prettier

## Implemented Features

### Authentication / Authorization
- `GET /api/auth/github`
- `GET /api/auth/github/callback`
- `POST /api/logout`
- `GET /api/me`
- RBAC middleware:
  - `requireAuth`
  - `requireRoles`
  - `requireRepositoryAccess`

### Users (Admin)
- `GET /api/users`
- `GET /api/users/:userId`
- `PUT /api/users/:userId`
- `DELETE /api/users/:userId` (soft deactivate)

### Repositories
- `GET /api/repositories`
- `POST /api/repositories`
- `GET /api/repositories/:repoId`
- `PUT /api/repositories/:repoId`
- `DELETE /api/repositories/:repoId`
- `POST /api/repositories/:repoId/sync`

### Workflows
- `GET /api/workflows`
- `GET /api/workflows/:workflowId`
- `GET /api/workflows/:workflowId/jobs`

### Analytics
- `GET /api/analytics`
- `GET /api/analytics/summary`
- `GET /api/analytics/trends`
- `GET /api/analytics/failure-rate`
- `GET /api/analytics/repositories`

### Realtime
- `GET /api/active-runs` (SSE)
- Socket event: `active-runs:updated`

### Issues / Comments
- `GET /api/repositories/:repoId/issues`
- `POST /api/repositories/:repoId/issues`
- `GET /api/repositories/:repoId/issues/:issueId`
- `PUT /api/repositories/:repoId/issues/:issueId`
- `DELETE /api/repositories/:repoId/issues/:issueId`
- `GET /api/issues/:issueId`
- `GET /api/issues/:issueId/comments`
- `POST /api/issues/:issueId/comments`
- `DELETE /api/issues/:issueId/comments/:commentId`

### Exports
- `GET /api/export/workflows.csv`
- `GET /api/export/workflows.json`

### System
- `GET /api/health`
- `GET /api/docs`

## Environment Variables

Copy `.env.example` to `.env` and fill values:

- `DATABASE_URL`
- `SESSION_SECRET`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `GITHUB_API_TOKEN` (recommended for sync)
- `ADMIN_GITHUB_IDS` / `ADMIN_GITHUB_USERNAMES`
- `VITE_API_URL`
- `VITE_API_WS_URL`

## Local Setup

### 1) Prerequisites
- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

### 2) Install dependencies
```bash
pnpm install
```

### 3) Start PostgreSQL
```bash
docker compose up -d
```

### 4) Prisma generate + migrate + seed
```bash
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
```

### 5) Run both apps
```bash
pnpm run dev
```

- API: `http://localhost:4000`
- Web: `http://localhost:5173`

## GitHub OAuth Setup

1. Create GitHub OAuth App.
2. Set callback URL to `http://localhost:4000/api/auth/github/callback`.
3. Put client ID/secret into `.env`.
4. Open `http://localhost:5173/login` and use **Continue with GitHub**.

## Role Access: Admin / DevOps / Developer

### Bootstrap roles in local development

The app keeps GitHub OAuth as the source of authentication and uses environment allow-lists to assign internal roles:

- `ADMIN_GITHUB_USERNAMES` / `ADMIN_GITHUB_IDS` → user becomes `ADMIN`
- `DEVOPS_GITHUB_USERNAMES` / `DEVOPS_GITHUB_IDS` → user becomes `DEVOPS`
- otherwise default role is `DEVELOPER`

Example `.env`:

```env
ADMIN_GITHUB_USERNAMES=your_admin_username
ADMIN_GITHUB_IDS=1234567
DEVOPS_GITHUB_USERNAMES=your_devops_username
DEVOPS_GITHUB_IDS=7654321
```

### First admin bootstrap flow

1. Put your GitHub username or ID in `ADMIN_GITHUB_USERNAMES` or `ADMIN_GITHUB_IDS`
2. Login via GitHub OAuth
3. Open `/profile` and confirm role badge shows `Admin`
4. Open `/users` and manage other users

### Testing all roles

- **Admin:** configured via admin bootstrap env vars above
- **DevOps:** configured via devops bootstrap env vars, or promoted by admin from Users page
- **Developer:** default for any OAuth user not matched by admin/devops bootstrap, or set by admin

## Repository Assignment Rules (RBAC)

- **Developer** can see workflow/repository data only for:
  - repositories assigned to them
  - repositories they connected/created
- **DevOps/Admin** can see all repositories/workflows
- Admin manages role and repository assignments in `/users`

## Workflow Sync: Why runs may not appear and how to fix

Workflow visibility is now fixed end-to-end with these behaviors:

1. Connect repository in `/repositories`
2. Click **Sync runs**
3. Server fetches GitHub Actions workflow runs (paginated) and persists runs + jobs
4. Open `/workflows` to browse runs
5. Open run details page for jobs/metadata

If no runs exist in the GitHub repository, UI clearly shows an explicit empty state.
If sync fails (permissions/repo/API), API now returns readable sync error text that is shown in UI.

### Source-of-truth model (important)

- GitHub is the authoritative source for repository/workflow/jobs data.
- PostgreSQL stores synchronized snapshots/cache for fast UI reads, analytics, reporting and history.
- The system uses a **hybrid sync strategy**:
  - eager sync on repository connect
  - manual sync via “Sync runs”
  - lazy/background refresh when repository/workflow data is stale or `refresh=true` is requested

Repository records now include sync metadata fields:

- `syncStatus` (`IDLE` | `SYNCING` | `SUCCESS` | `ERROR`)
- `lastSyncedAt`
- `lastSuccessfulSyncAt`
- `syncError`
- `sourceUpdatedAt`

### GitHub permissions requirements

- OAuth login: `read:user`, `user:email`
- Repository sync: server token (`GITHUB_API_TOKEN`) should have access to target repositories and Actions data
- For private repos, token must include the repository in scope

## Logout flow

- Visible logout button is available in the top-right authenticated header.
- Clicking logout calls `POST /api/auth/logout`, clears auth cookie/session, resets frontend auth state, clears cached queries, and redirects to `/login`.

## Troubleshooting

### No workflows visible

1. Verify repository exists in `/repositories`
2. Check repository sync status column (`SUCCESS` expected)
3. If status is `ERROR`, read `syncError` and fix token/repo permissions
4. Click **Sync runs** again
5. In `/workflows`, optionally enable “Refresh from GitHub on apply” and apply filters

### Admin role not applied

1. Ensure `.env` includes correct `ADMIN_GITHUB_USERNAMES` or `ADMIN_GITHUB_IDS`
2. Re-login via GitHub OAuth
3. Open `/profile` and verify role badge is `ADMIN`

### Logout not working

1. Confirm frontend calls `POST /api/auth/logout`
2. Confirm `dwmas_token` cookie is cleared in browser devtools
3. Protected routes should redirect to `/login` after logout

## Report Templating (MVP)

Report templates are saved filter configurations for workflows analytics/export.

Each template can include:

- report name + description + type
- date range preset (`7d`, `30d`, `90d`, `custom`)
- filters (`status`, `conclusion`, `branch`, `actor`)
- optional repository targeting
- export format preference (CSV/JSON-ready)

### Template flow

1. Open `/reports`
2. Create template with desired filters
3. Save template
4. Apply template to preview filtered workflow data
5. Export CSV using template action

### Example templates

- Failed runs last 30 days
- Repository health overview
- Main branch deployment failures
- Average duration trend by repository

## Demo Data and Admin Bootstrap

- Prisma seed creates:
  - admin-like demo user
  - one repository
  - repository assignment
  - report templates
- First login becomes `ADMIN` when GitHub ID or username matches:
  - `ADMIN_GITHUB_IDS`
  - `ADMIN_GITHUB_USERNAMES`

## Testing

```bash
pnpm run test
```

## Lint / Format

```bash
pnpm run lint
pnpm run format
```

## Shell Note (macOS zsh)

If zsh suggests `correct 'pnpm' to 'npm'`, choose **`n`**. Using npm in this workspace can break pnpm workspace linking.

## API Documentation

- Basic OpenAPI-like descriptor: `GET /api/docs`

## ERD and Diagrams

See `docs/`:
- `docs/architecture.md`
- `docs/oauth-sequence.md`
- `docs/workflow-sync-sequence.md`

## Fully Implemented vs Optional

Implemented:
- Monorepo architecture
- OAuth-only auth flow
- RBAC and repository-scoped access checks
- Repository onboarding + workflow sync with Octokit
- Realtime stream and socket push
- Analytics, exports, local issues/comments
- Seed/bootstrap path and base tests

Optional/Future:
- richer Swagger UI generation
- webhook-triggered sync
- advanced analytics caching and report template UI
- broader test coverage for all pages and edge conditions

## Deployment Next Steps

1. Move secrets to secure vault.
2. Use managed PostgreSQL.
3. Set `NODE_ENV=production` and secure cookie domain.
4. Build web assets and serve behind reverse proxy.
5. Add CI pipeline and production observability.

## License

MIT (`LICENSE`)
