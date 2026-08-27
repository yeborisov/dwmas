FROM node:20-alpine
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/github-gateway/package.json ./apps/github-gateway/package.json

RUN npm install -g pnpm@9.12.1 && pnpm install --filter github-gateway... --frozen-lockfile

COPY apps/github-gateway ./apps/github-gateway

RUN pnpm --filter github-gateway build

WORKDIR /app/apps/github-gateway
EXPOSE 4000
CMD ["pnpm", "start"]
