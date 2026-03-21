FROM node:20-alpine
WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy workspace packages needed for install
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/prisma ./apps/api/prisma

# Allow necessary install/build scripts (e.g., Prisma engines) during install
ENV DATABASE_URL="postgresql://dwmas:dwmas@localhost:5432/dwmas?schema=public"
ENV PRISMA_SKIP_AUTOINSTALL=true
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=true
ENV PNPM_ALLOW_SCRIPTS="*"

RUN npm install -g pnpm && pnpm install -r --filter @dwmas/api... --frozen-lockfile --prod=false

# Verify prisma client is installed
RUN pnpm list @prisma/client --depth -1 || true

# Prisma client generation (requires DATABASE_URL at build time)
RUN pnpm --filter @dwmas/api exec prisma generate --schema prisma/schema.prisma

# Copy the rest of the api sources
COPY apps/api ./apps/api

RUN pnpm --filter @dwmas/api build

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["pnpm", "start"]
