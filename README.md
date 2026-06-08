# Transportation App

Приложение для оформления заказов на грузоперевозки между городами.

## Структура

- `frontend` - React + TypeScript
- `backend` - Express + TypeScript
- `db` - инициализация PostgreSQL

## Запуск через Docker

```bash
docker compose up --build
```

После запуска:

- frontend: `http://localhost:3000`
- backend: `http://localhost:4000`
- postgres: `localhost:5432`

## Локальная разработка без Docker

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Переменные окружения backend

См. `backend/.env.example`

## Тесты backend

```bash
cd backend
npm test
```
