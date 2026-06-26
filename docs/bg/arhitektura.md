# Системна архитектура

## Обща схема

```mermaid
flowchart LR
  subgraph Клиент
    A["React SPA (web)"]
  end

  subgraph Платформа
    B["API (Express + Prisma)"]
    C[GitHub Gateway]
    D[Worker]
    E[(PostgreSQL)]
    F[(Redis)]
  end

  subgraph Външно
    G["GitHub API"]
  end

  A -->|REST/JSON + бисквитки| B
  A -->|Socket.IO + SSE| B
  B -->|"Автентикация (GitHub OAuth)"| C
  B -->|Четене/запис в БД| E
  B <-->|Pub/Sub събития| F
  C -->|Octokit| G
  D -->|"Опашки (BullMQ)"| F
  D -->|Синхронизира данни| G
  D -->|Запазва снимки| E
  B -->|Изпраща синхр. задачи| D
```

### Ключови идеи

- **React SPA** комуникира само с API-то; реално-временните обновявания минават през Socket.IO и SSE.
- **API** притежава автентикацията, сесиите, RBAC и бизнес логиката; Prisma медиира достъпа до PostgreSQL.
- **GitHub Gateway** централизира изходящия GitHub трафик – токени, rate limits, App credentials.
- **Worker** консумира фонови задачи от Redis (BullMQ) за синхронизация на хранилища, workflow изпълнения, задачи и аналитика.
- **PostgreSQL** съхранява кешираното състояние и аналитичните данни; GitHub остава истинният източник.
- **Redis** е едновременно опашков бекенд (BullMQ) и лек pub/sub за реално-временни обновявания.

---

## Автентикация и сесии

```mermaid
sequenceDiagram
  participant U as Потребител
  participant W as Web App
  participant API as DWMAS API
  participant GH as GitHub OAuth
  participant DB as PostgreSQL

  U->>W: Натиска "Влез с GitHub"
  W->>API: GET /api/auth/github
  API->>GH: Пренасочване към authorize
  GH-->>U: Форма за вход + съгласие
  GH->>API: Обратно извикване с code
  API->>GH: Размяна на code за access token
  API->>API: Извличане на GitHub профил (Gateway)
  API->>DB: Намиране / създаване на потребител + сесия
  API->>API: Присвояване на роля (ADMIN ако е в allow-list, иначе DEVELOPER)
  API-->>U: httpOnly бисквитка + пренасочване към /dashboard
  U->>API: GET /api/me
  API-->>U: Данни за автентикирания потребител
```

**Бележки:**
- Passport GitHub strategy управлява OAuth handshake-а.
- Сесийните/JWT секрети се конфигурират чрез env; бисквитките защитават SPA.

---

## Синхронизация на данни

```mermaid
sequenceDiagram
  participant API as DWMAS API
  participant Worker as Worker
  participant Redis as Redis
  participant GH as GitHub API
  participant DB as PostgreSQL

  API->>Redis: Поставя синхр. задача (repo / workflow)
  Worker->>Redis: Взима задачата
  Worker->>GH: Извлича metadata / изпълнения / задачи
  Worker->>DB: Upsert Repository, WorkflowRun, Job редове
  Worker->>Redis: Изпраща progress/status събития
  API-->>Клиент: Реално-временни обновявания (Socket.IO/SSE)
```

**Стратегия за синхронизация:**
- **Активна** – при свързване на хранилище
- **Ръчна** – при натискане на "Sync runs"
- **Фонова/периодична** – при остарели данни или `refresh=true`

**Метаданни за синхронизация на хранилище:**

| Поле | Стойности |
|---|---|
| `syncStatus` | `IDLE` \| `SYNCING` \| `SUCCESS` \| `ERROR` |
| `lastSyncedAt` | Последно опит |
| `lastSuccessfulSyncAt` | Последен успех |
| `syncError` | Текст на грешката |
| `sourceUpdatedAt` | Последна промяна в GitHub |

---

## Реално-временни обновявания

```mermaid
flowchart LR
  Worker -->|"progress / completed"| Redis
  Redis -->|pub/sub| API
  API -->|Socket.IO стая за всяко repo| Web
  API -->|SSE /api/active-runs| Web
```

Събитията включват: прогрес на синхронизация, нови workflow изпълнения, обновявания на задачи, тригери за обновяване на аналитиката.

---

## GitHub Gateway

```mermaid
flowchart TB
  API -->|ANY /api/github/*| GW[GitHub Gateway]
  Worker -->|ANY /api/github/*| GW
  GW -->|Octokit + избран токен| GitHub[GitHub API]
  GW <-->|GET кеш| Redis
  GW -->|X-RateLimit-* проследяване| TokenPool[Пул от токени]
```

| Функция | Описание |
|---|---|
| Пул от токени | GitHub App (основен) + PAT резерв |
| Превантивно превключване | При < 20% оставаща квота |
| Кеширане | Само GET заявки; конфигурируемо TTL (по подразбиране 60 с) |
| Инвалидиране | `DELETE /cache` или `DELETE /cache/prefix` |
| Метрики | Prometheus + alert hooks |

---

## Разгръщане (локална среда)

```mermaid
flowchart TB
  subgraph docker-compose
    api[dwmas-api :4000]
    web[dwmas-web :5173]
    gw[dwmas-github-gateway]
    worker[dwmas-worker]
    pg[(postgres :5432)]
    redis[(redis :6379)]
  end

  api --> pg
  api --> redis
  api --> gw
  worker --> pg
  worker --> redis
  web --> api
  gw --> redis
```

```bash
# Стартиране на всички услуги
docker compose up -d

# Прилагане на схемата
pnpm --filter @dwmas/api exec prisma migrate deploy
```

---

## База данни – ключови таблици

| Таблица | Произход | Описание |
|---|---|---|
| `Repository` | GitHub | Metadata за хранилището, статус на синхр. |
| `WorkflowRun` | GitHub | Изпълнения на workflow: статус, клон, актьор |
| `Job` | GitHub | Отделни задачи в рамките на изпълнение |
| `Issue` | GitHub / локални | Проблеми, огледани от GitHub Issues |
| `Comment` | GitHub / локални | Коментари към issues |
| `ReportTemplate` | Локални | Запазени конфигурации на филтри за отчети |
| `AuditLog` | Локални | История на действията (кой, кога, какво) |
| `User` | Локални | Профил от GitHub OAuth + роля + статус |
| `UserRepositoryAssignment` | Локални | RBAC: кой потребител до кое хранилище |

---

## Оперативни бележки

- GitHub е истинският източник; PostgreSQL е кеш и аналитично хранилище.
- При грешки за липсващи таблици – стартирай миграциите преди приложението.
- Redis `maxRetriesPerRequest` трябва да е `null` (препоръка на BullMQ).
