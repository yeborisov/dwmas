# REST API Справочник

Базов URL: `http://localhost:4000`

Всички защитени маршрути изискват валидна httpOnly сесийна бисквитка (`dwmas_token`), получена след GitHub OAuth вход.

---

## Автентикация

| Метод | Маршрут | Описание | Достъп |
|---|---|---|---|
| `GET` | `/api/auth/github` | Стартира GitHub OAuth flow | Публичен |
| `GET` | `/api/auth/github/callback` | OAuth callback (управляван от Passport) | Публичен |
| `POST` | `/api/auth/logout` | Изчиства сесията и бисквитката | Автентикиран |
| `GET` | `/api/me` | Връща данните за текущия потребител | Автентикиран |

---

## Потребители (само Admin)

| Метод | Маршрут | Описание |
|---|---|---|
| `GET` | `/api/users` | Списък с всички потребители |
| `GET` | `/api/users/:userId` | Детайли за потребител |
| `PUT` | `/api/users/:userId` | Обновяване на роля / статус |
| `DELETE` | `/api/users/:userId` | Мека деактивация |

**Пример – обновяване на роля:**
```json
PUT /api/users/clxxxxxx
{
  "role": "DEVOPS"
}
```

---

## Хранилища

| Метод | Маршрут | Описание | Достъп |
|---|---|---|---|
| `GET` | `/api/repositories` | Списък (Admin/DevOps – всички; Developer – назначените) | Автентикиран |
| `POST` | `/api/repositories` | Добавяне на хранилище | Admin/DevOps |
| `GET` | `/api/repositories/:repoId` | Детайли за хранилище | Автентикиран |
| `PUT` | `/api/repositories/:repoId` | Обновяване на metadata | Admin/DevOps |
| `DELETE` | `/api/repositories/:repoId` | Деактивация | Admin |
| `POST` | `/api/repositories/:repoId/sync` | Ръчна синхронизация | Admin/DevOps |

**Пример – добавяне на хранилище:**
```json
POST /api/repositories
{
  "owner": "octocat",
  "name": "hello-world"
}
```

**Поля на syncStatus:**
- `IDLE` – никога не е синхронизирано
- `SYNCING` – в момента върви синхронизация
- `SUCCESS` – последната синхронизация е успешна
- `ERROR` – последната синхронизация е неуспешна; виж `syncError`

---

## Workflow изпълнения

| Метод | Маршрут | Описание |
|---|---|---|
| `GET` | `/api/workflows` | Списък с изпълнения (с филтри) |
| `GET` | `/api/workflows/:workflowId` | Детайли за изпълнение |
| `GET` | `/api/workflows/:workflowId/jobs` | Задачи в рамките на изпълнение |

**Query параметри за `/api/workflows`:**

| Параметър | Тип | Описание |
|---|---|---|
| `repositoryId` | string | Филтриране по хранилище |
| `status` | string | `queued`, `in_progress`, `completed` |
| `conclusion` | string | `success`, `failure`, `cancelled`, ... |
| `branch` | string | Клон (напр. `main`) |
| `actor` | string | GitHub username на тригера |
| `refresh` | boolean | Принудително обновяване от GitHub |

---

## Аналитика

| Метод | Маршрут | Описание |
|---|---|---|
| `GET` | `/api/analytics` | Пълни аналитични данни |
| `GET` | `/api/analytics/summary` | Обобщен преглед |
| `GET` | `/api/analytics/trends` | Тенденции по период |
| `GET` | `/api/analytics/failure-rate` | Процент неуспехи |
| `GET` | `/api/analytics/repositories` | Статистика по хранилище |

---

## Реално-времени обновявания

| Метод | Маршрут | Описание |
|---|---|---|
| `GET` | `/api/active-runs` | SSE поток – активни изпълнения |

**Socket.IO събитие:** `active-runs:updated`

Примерно свързване от frontend:
```js
const eventSource = new EventSource('/api/active-runs', { withCredentials: true })
eventSource.onmessage = (e) => console.log(JSON.parse(e.data))
```

---

## Issues

| Метод | Маршрут | Описание |
|---|---|---|
| `GET` | `/api/repositories/:repoId/issues` | Списък с issues за хранилище |
| `POST` | `/api/repositories/:repoId/issues` | Създаване на issue |
| `GET` | `/api/repositories/:repoId/issues/:issueId` | Детайли за issue |
| `PUT` | `/api/repositories/:repoId/issues/:issueId` | Обновяване на issue |
| `DELETE` | `/api/repositories/:repoId/issues/:issueId` | Изтриване на issue |
| `GET` | `/api/issues/:issueId` | Issue по ID (без repoId) |

**Пример – създаване на issue:**
```json
POST /api/repositories/clxxxxxx/issues
{
  "title": "Workflow failing on main branch",
  "description": "Deploy job exits with code 1 since yesterday."
}
```

---

## Коментари

| Метод | Маршрут | Описание |
|---|---|---|
| `GET` | `/api/issues/:issueId/comments` | Списък с коментари |
| `POST` | `/api/issues/:issueId/comments` | Добавяне на коментар |
| `DELETE` | `/api/issues/:issueId/comments/:commentId` | Изтриване на коментар |

---

## Exports

| Метод | Маршрут | Описание |
|---|---|---|
| `GET` | `/api/export/workflows.csv` | Изтегляне на workflow данни като CSV |
| `GET` | `/api/export/workflows.json` | Изтегляне на workflow данни като JSON |

И двата endpoint-а поддържат същите query параметри като `/api/workflows`.

---

## Шаблони за отчети

| Метод | Маршрут | Описание |
|---|---|---|
| `GET` | `/api/reports` | Списък с шаблони |
| `POST` | `/api/reports` | Създаване на шаблон |
| `GET` | `/api/reports/:id` | Детайли за шаблон |
| `PUT` | `/api/reports/:id` | Обновяване на шаблон |
| `DELETE` | `/api/reports/:id` | Изтриване на шаблон |

**Пример – създаване на шаблон:**
```json
POST /api/reports
{
  "name": "Провалени изпълнения – последните 30 дни",
  "description": "Филтър за провалени workflow по главния клон",
  "type": "workflow",
  "configJson": {
    "dateRange": "30d",
    "status": "completed",
    "conclusion": "failure",
    "branch": "main"
  }
}
```

---

## Системни

| Метод | Маршрут | Описание |
|---|---|---|
| `GET` | `/api/health` | Проверка на статуса на API |
| `GET` | `/api/docs` | Основно OpenAPI описание |

---

## Кодове на грешки

| Код | Значение |
|---|---|
| `400` | Невалидни входни данни (Zod validation) |
| `401` | Неавтентикиран – необходим е вход |
| `403` | Забранен достъп – недостатъчна роля |
| `404` | Ресурсът не е намерен |
| `409` | Конфликт (напр. дублирано хранилище) |
| `500` | Вътрешна грешка на сървъра |

Тялото на грешката:
```json
{
  "error": "Описание на грешката"
}
```
