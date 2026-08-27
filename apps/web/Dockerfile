FROM node:20-alpine
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/package.json

RUN npm install -g pnpm@9.12.1 && pnpm install --filter @dwmas/web... --frozen-lockfile

COPY apps/web ./apps/web

WORKDIR /app/apps/web
EXPOSE 5173
CMD ["pnpm", "dev"]
