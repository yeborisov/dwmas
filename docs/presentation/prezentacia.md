# DWMAS – Курсов проект

**DevOps Workflow Monitoring & Analytics System**

- Автор: Yordan B. | ФН: 9MI3400735
- Курс: Full Stack Application Development with Node.js + Express.js + React.js – 2026
- GitHub: [https://github.com/yeborisov/dwmas](https://github.com/yeborisov/dwmas)

---

## Проблем и цел

**Проблем:** GitHub няма централизирано табло за workflow статуси на ниво организация.

**Цел:** Единна платформа за наблюдение на GitHub Actions в множество хранилища – в реално време.

---

## Архитектура

```
Web (React SPA)
    ↕ REST + SSE + Socket.IO
API (Express + Prisma + PostgreSQL)
    ↕ HTTP
GitHub Gateway (прокси, Redis кеш, токен пул)
    ↕ Octokit
GitHub API
Worker (BullMQ) ──► синхронизация на фон
```

- Монорепо: `apps/api`, `apps/web`, `apps/github-gateway`, `apps/worker`
- Инфраструктура: PostgreSQL + Redis + Docker Compose

---

## Основни функции

| Функция | Детайл |
|---|---|
| GitHub OAuth | Без пароли; httpOnly cookie сесии |
| Синхронизация | Workflow runs, jobs, commits чрез Octokit |
| Реално-времени обновявания | SSE + Socket.IO |
| Аналитично табло | Recharts – success rate, duration trends |
| Issues | Локални + синхронизация с GitHub Issues |
| Export | CSV и JSON |
| RBAC | Три роли: ADMIN / DEVOPS / DEVELOPER |

---

## Технологичен стек

**Frontend:** React 18, Vite, TypeScript, TanStack Query, Zustand, Tailwind CSS

**Backend:** Node.js, Express, Prisma ORM, Zod, Pino, Passport.js

**Инфраструктура:** PostgreSQL, Redis (BullMQ pub/sub), Docker

---

## Демо / Резултат

- Работещо full-stack приложение с Docker Compose (`docker compose up -d && pnpm dev`)
- GitHub OAuth поток → автоматично создаване на потребител → RBAC
- Live табло с workflow статуси и аналитика
- Пълна документация на български: [docs/bg/](./bg/)

**GitHub:** [https://github.com/yeborisov/dwmas](https://github.com/yeborisov/dwmas)
