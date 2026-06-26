# Инсталация и конфигурация

## Предварителни изисквания

| Инструмент | Минимална версия |
|---|---|
| Node.js | 20+ |
| pnpm | 9+ |
| Docker + Docker Compose | последна стабилна |
| GitHub акаунт | – |

---

## Стъпка 1 – Клониране и зависимости

```bash
git clone <repo-url> dwmas
cd dwmas
pnpm install
```

---

## Стъпка 2 – Конфигуриране на средата

```bash
cp .env.example .env
```

Попълни задължителните стойности:

```env
# База данни
DATABASE_URL=postgresql://dwmas:dwmas@localhost:5432/dwmas

# Сесия / JWT
SESSION_SECRET=some-random-secret
JWT_SECRET=another-random-secret

# CORS
CORS_ORIGIN=http://localhost:5173

# GitHub OAuth App
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback

# GitHub API токен (за синхронизация)
GITHUB_API_TOKEN=ghp_xxxxxxxxxxxx

# Роли при влизане (по GitHub username или ID)
ADMIN_GITHUB_USERNAMES=your_github_username
ADMIN_GITHUB_IDS=your_github_id
DEVOPS_GITHUB_USERNAMES=
DEVOPS_GITHUB_IDS=

# Frontend URL-и
VITE_API_URL=http://localhost:4000
VITE_API_WS_URL=http://localhost:4000
```

---

## Стъпка 3 – GitHub OAuth App

1. Отвори [github.com/settings/developers](https://github.com/settings/developers)
2. **New OAuth App**
3. Попълни:
   - **Application name:** DWMAS Local
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:4000/api/auth/github/callback`
4. Копирай **Client ID** и **Client Secret** в `.env`

---

## Стъпка 4 – Стартиране на базата данни

```bash
docker compose up -d
```

Проверка дали PostgreSQL и Redis работят:

```bash
docker compose ps
```

---

## Стъпка 5 – Prisma миграции и seed

```bash
pnpm run prisma:generate   # генерира Prisma клиент
pnpm run prisma:migrate    # прилага миграции
pnpm run prisma:seed       # зарежда демо данни
```

Seed създава:
- демо администраторски потребител
- едно хранилище
- присвояване на хранилище
- шаблони за отчети

---

## Стъпка 6 – Стартиране на приложението

```bash
pnpm run dev
```

| Услуга | URL |
|---|---|
| Web (SPA) | http://localhost:5173 |
| API | http://localhost:4000 |
| API здраве | http://localhost:4000/api/health |

---

## Bootstrap на администраторска роля

1. Добави GitHub username/ID в `.env`:
   ```env
   ADMIN_GITHUB_USERNAMES=your_username
   ```
2. Влез чрез GitHub OAuth на `/login`
3. Отвори `/profile` и потвърди бейджа **Admin**
4. Управлявай потребителите от `/users`

---

## Отстраняване на проблеми

### Не виждам workflow изпълнения

1. Провери дали хранилището съществува в `/repositories`
2. Провери колоната `syncStatus` — трябва да е `SUCCESS`
3. Ако е `ERROR`, прочети `syncError` и поправи токена/правата
4. Натисни **Sync runs** отново

### Ролята Admin не се прилага

1. Увери се, че `.env` съдържа правилния `ADMIN_GITHUB_USERNAMES` или `ADMIN_GITHUB_IDS`
2. Влез отново чрез GitHub OAuth
3. Провери `/profile` – бейджът трябва да показва `ADMIN`

### Изходът не работи

1. Провери дали frontend извиква `POST /api/auth/logout`
2. Провери дали бисквитката `dwmas_token` е изчистена в DevTools
3. Защитените маршрути трябва да пренасочват към `/login` след logout

### macOS / zsh предлага npm вместо pnpm

Избери **`n`** на въпроса. Използването на `npm` в pnpm workspace нарушава свързването.

---

## Производствено разгръщане (следващи стъпки)

1. Прехвърли секретите в сигурно хранилище (Vault / Secrets Manager)
2. Използвай управляван PostgreSQL (RDS, Supabase и т.н.)
3. Задай `NODE_ENV=production` и защити домейна на бисквитките
4. Изгради frontend активите и ги обслужвай зад reverse proxy (Nginx/Caddy)
5. Добави CI pipeline и production observability (Prometheus, Grafana)
