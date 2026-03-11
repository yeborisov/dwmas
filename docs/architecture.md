# DWMAS Architecture Diagram

```mermaid
flowchart LR
  A[Browser SPA React] -->|REST/JSON + Cookie| B[Express API]
  A -->|Socket.IO| B
  A -->|SSE /api/active-runs| B
  B --> C[Auth: GitHub OAuth Passport]
  B --> D[Prisma ORM]
  D --> E[(PostgreSQL)]
  B --> F[Octokit GitHub API]
  F --> G[GitHub Repos + Actions Runs + Jobs]
```

## Notes
- SPA handles public and protected views.
- API enforces RBAC and repository-level access.
- **Source of truth:** GitHub (repositories/workflow runs/jobs).
- **PostgreSQL role:** cache/snapshot/history for fast reads, analytics and reporting.
- Sync strategy is hybrid:
  - eager sync on repository connect
  - manual sync on demand
  - lazy/background refresh for stale repository/workflow reads
