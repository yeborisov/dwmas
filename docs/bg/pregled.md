# DevOps Workflow Monitoring & Analytics System (DWMAS)

## Курс и автор

- **Курс:** Full Stack Application Development with Node.js + Express.js + React.js – 2026
- **Автор:** Yordan B.
- **ФН:** 9MI3400735
- **GitHub:** [https://github.com/yeborisov/dwmas](https://github.com/yeborisov/dwmas)

---

## Описание на проекта

DWMAS е full-stack платформа за централизирано наблюдение на GitHub Actions workflow изпълнения в множество хранилища. Системата предоставя единна оперативна картина, която GitHub по подразбиране не осигурява на ниво организация.

### Бизнес нужди

| Нужда | Как DWMAS я решава |
|---|---|
| Централизирано наблюдение | Единно табло за всички хранилища |
| Бързо засичане на инциденти | Реално-временни известия при провалени/бавни pipeline-и |
| Аналитика | Исторически графики и CSV/JSON export |
| Контрол на достъпа | Вградена RBAC система с три роли |

---

## Основни функции

- **GitHub OAuth автентикация** – без локални пароли; достъп само чрез GitHub акаунт
- **Автоматично създаване на потребител** при първо влизане
- **Синхронизация на хранилища** – workflow изпълнения и задачи чрез Octokit
- **Реално-времени обновявания** – SSE и Socket.IO
- **Аналитично табло** – графики с Recharts
- **Локални issues и коментари** – синхронизирани с GitHub Issues
- **Export** – CSV и JSON
- **Управление на потребители** – само за администратори

---

## Технологичен стек

### Frontend
- React 18, Vite, TypeScript
- React Router, TanStack Query, Zustand
- Tailwind CSS, Recharts

### Backend
- Node.js, Express, TypeScript
- Prisma ORM + PostgreSQL
- GitHub OAuth (Passport.js), httpOnly cookie
- Zod (валидация), Pino (логове)
- SSE + Socket.IO (реално-времени обновявания)
- Octokit (GitHub интеграция)

### Инфраструктура
- Redis (BullMQ опашки + pub/sub)
- Docker + Docker Compose

---

## Структура на монорепото

```text
dwmas/
  apps/
    api/                # Express бекенд (REST, RBAC, Prisma, реално-время)
    web/                # React SPA табло
    github-gateway/     # Прокси: пул от токени, Redis кеш, GitHub API
    worker/             # BullMQ работник (синхронизация, аналитика)
  packages/
    shared/             # Общи константи, типове, помощни функции
    github-contracts/   # Типизирани договори Gateway ↔ API
  prisma/
    schema.prisma       # Канонична Prisma схема
  docs/
    architecture.md          # Архитектура + Mermaid диаграми
    oauth-sequence.md        # GitHub OAuth последователност
    workflow-sync-sequence.md # Синхронизация на workflow
    bg/                      # Документация на български
```

---

## Роли и достъп

| Роля | Какво може |
|---|---|
| `ADMIN` | Пълен достъп; управление на потребители и роли |
| `DEVOPS` | Достъп до всички хранилища и workflow данни |
| `DEVELOPER` | Достъп само до назначените хранилища |

Първото присвояване на роли се прави чрез env позволителни списъци (`ADMIN_GITHUB_USERNAMES`, `DEVOPS_GITHUB_USERNAMES`). По подразбиране всеки нов потребител получава роля `DEVELOPER`.

---

## Бързо стартиране

Вижте [настройка.md](./nastroika.md) за подробни инструкции.

```bash
# 1. Инсталирай зависимости
pnpm install

# 2. Стартирай PostgreSQL и Redis
docker compose up -d

# 3. Приложи миграции
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed

# 4. Стартирай приложението
pnpm run dev
# API: http://localhost:4000
# Web: http://localhost:5173
```

---

## Допълнителна документация

| Документ | Описание |
|---|---|
| [nastroika.md](./nastroika.md) | Инсталация и конфигурация |
| [arhitektura.md](./arhitektura.md) | Системна архитектура |
| [api-spravochnik.md](./api-spravochnik.md) | REST API референция |
| [rbac.md](./rbac.md) | Роли и управление на достъпа |
| [../architecture.md](../architecture.md) | Архитектурни диаграми (EN) |
