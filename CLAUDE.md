# CLAUDE.md

## Project Overview

**Numo** is a personal expense tracking application. It allows users to record and manage their financial activity, including debits (expenses) and credits (income).

The system is designed as a full-stack application with a REST API backend and a modern frontend.

---

## Tech Stack

### Backend

- Python
- Flask (REST API)
- SQLite (database)
- Gunicorn (WSGI server)

### Frontend

- React
- TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- shadcn/ui (UI components)
- lucide-react (icons)

### Infrastructure

- Docker
- docker-compose

---

## Architecture

- The backend exposes a REST API.
- The frontend consumes the API.
- The backend runs inside a Docker container and listens on port `8080`.
- SQLite is used as the database for simplicity and local development.

---

## Development Environment

- The project is containerized using Docker.
- Services are orchestrated using docker-compose.
- The backend container uses Gunicorn as the application server.

---

## Database Schema

### categories

| field | type        | nullable | index   |
| ----- | ----------- | -------- | ------- |
| id    | integer     | no       | primary |
| name  | varchar(50) | no       | unique  |

---

### places

| field | type         | nullable | index   |
| ----- | ------------ | -------- | ------- |
| id    | integer      | no       | primary |
| name  | varchar(100) | no       | unique  |

---

### debits

| field        | type          | nullable | index   | description               |
| ------------ | ------------- | -------- | ------- | ------------------------- |
| id           | integer       | no       | primary | Unique identifier         |
| category_id  | integer       | no       | index   | Reference to categories   |
| place_id     | integer       | no       | index   | Reference to places       |
| debited_at   | datetime      | no       |         | When the expense occurred |
| amount       | decimal(10,2) | no       |         | Expense amount            |
| observations | text          | yes      |         | Optional notes            |

---

### credits

| field        | type          | nullable | index   | description              |
| ------------ | ------------- | -------- | ------- | ------------------------ |
| id           | integer       | no       | primary | Unique identifier        |
| credited_at  | datetime      | no       |         | When the income occurred |
| amount       | decimal(10,2) | no       |         | Income amount            |
| observations | text          | yes      |         | Optional notes           |

---

## Naming Conventions

- Use `snake_case` for database fields.
- Use `_at` suffix for timestamps (e.g., `credited_at`, `debited_at`).
- Use singular resource names in database tables.
- Keep naming consistent between backend and frontend when possible.

---

## API Guidelines

- Follow REST conventions.
- Use JSON for request/response bodies.
- Use proper HTTP status codes.
- Keep endpoints resource-oriented (e.g., `/debits`, `/credits`, `/categories`).

---

## Frontend Guidelines

- Use functional React components.
- Prefer TypeScript types/interfaces for all data structures.
- Use Tailwind for styling (avoid custom CSS unless necessary).
- Use shadcn/ui components when possible.
- Use lucide-react for icons.

---

## Notes for AI Assistants

- Prefer simple, maintainable solutions over complex abstractions.
- Keep the project lightweight (avoid unnecessary dependencies).
- Follow existing patterns in the codebase before introducing new ones.
- Ensure consistency in naming and structure across backend and frontend.
