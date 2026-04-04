# CLAUDE.md

## Project Overview

**Numo** is a personal expense tracking application. It allows users to record and manage their financial activity, including debits (expenses) and credits (income).

The system is designed as a full-stack application with a REST API backend and a modern frontend.

---

## Tech Stack

### Backend

- Python 3.11
- Flask (REST API)
- flask-cors (Cross-Origin Resource Sharing)
- SQLAlchemy (ORM)
- Marshmallow (Data validation)
- SQLite (database)
- Gunicorn (WSGI server)
- pytest (testing framework)
- pytest-flask (Flask testing)
- pytest-cov (coverage reporting)
- factory-boy (test data generation)

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
- Flask-CORS is configured to allow requests from localhost:3000 and localhost:5173 (Vite/React dev servers).
- Backend port is configurable via `BACKEND_PORT` environment variable (default: 8080).
- Allowed origins for CORS are configurable via `ALLOWED_ORIGINS` environment variable.

### Dependencies Organization

- **requirements.txt** - Production dependencies only
- **requirements-dev.txt** - Development/testing dependencies only
- Dockerfile installs both files for complete functionality during development

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
| place_id     | integer       | yes      | index   | Reference to places       |
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

## API Documentation

- **OpenAPI Specification**: See `numo.yml` for complete API specification (OpenAPI 3.0.0 format)
- The OpenAPI specification documents all 4 resources (Categories, Places, Debits, Credits) with 19 endpoints
- **IMPORTANT**: Whenever the API is modified (new endpoints, schema changes, status code changes), the `numo.yml` file MUST be updated to reflect these changes
- The specification includes request/response examples, validation rules, and error responses

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
- Use proper HTTP status codes (201 for POST, 200 for GET/PUT, 204 for DELETE, 400/404/409 for errors).
- Keep endpoints resource-oriented (e.g., `/debits`, `/credits`, `/categories`).
- Use Marshmallow schemas for request validation.
- Always update `numo.yml` OpenAPI specification when making API changes.

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
- **Always update `numo.yml` OpenAPI specification when modifying API endpoints, schemas, or status codes**.
- Run the test suite with `docker-compose exec -T backend pytest tests/ -v --cov=app` to verify changes.
- Aim for maintaining 80%+ code coverage with comprehensive test cases.
