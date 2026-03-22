# Prisma schema

Canonical Prisma schema for the API (PostgreSQL). The root schema here is copied into `apps/api/prisma/schema.prisma` by the helper scripts before running Prisma commands.

## Commands (run from repo root)

```bash
pnpm prisma:generate   # copies schema into apps/api/prisma and runs prisma generate
pnpm prisma:migrate    # copies schema and runs prisma migrate dev
pnpm prisma:seed       # seeds via apps/api/src/prisma/seed.ts
```

Migrations are stored under `apps/api/prisma/migrations/` after running migrate.

## Environment

- `DATABASE_URL` must point to your Postgres instance (see `.env.example`).
- Optional: `PRISMA_GENERATE_SKIP_AUTOINSTALL=1` is set in scripts to avoid auto-installing client deps.

## Notes

- Update `prisma/schema.prisma` here; do not edit `apps/api/prisma/schema.prisma` directly.
- After schema changes, run `pnpm prisma:migrate` (and commit the generated migration) and `pnpm prisma:generate`.
