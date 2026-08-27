FROM node:20-alpine
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/worker/package.json ./apps/worker/package.json

RUN npm install -g pnpm@9.12.1 && pnpm install --filter worker... --frozen-lockfile

COPY apps/worker ./apps/worker

RUN pnpm --filter worker build

WORKDIR /app/apps/worker
CMD ["pnpm", "start"]
