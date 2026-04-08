# AGENTS.md

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

See [backend/app/models/SCHEMA.md](backend/app/models/SCHEMA.md) for complete database schema documentation.

---

## API Documentation

- **OpenAPI Specification**: See `numo.yml` for complete API specification (OpenAPI 3.0.0 format)
- The OpenAPI specification documents all 4 resources (Categories, Places, Debits, Credits) with 19 endpoints
- **IMPORTANT**: Whenever the API is modified (new endpoints, schema changes, status code changes), the `numo.yml` file MUST be updated to reflect these changes
- The specification includes request/response examples, validation rules, and error responses

---

## Documentation References

### Data Layer

- **Database Schema**: [backend/app/models/SCHEMA.md](backend/app/models/SCHEMA.md) - Complete schema documentation for all tables
- **Validation Schemas**: [backend/app/http/validation/](backend/app/http/validation/) - Marshmallow validation schemas for request/response handling

### Testing & Fixtures

- **Test Suite**: [backend/tests/](backend/tests/) - Comprehensive pytest test suite with 62+ tests achieving 80%+ code coverage
- **Test Fixtures**: [backend/tests/conftest.py](backend/tests/conftest.py) - Pytest fixtures for all models
- **Factory Helpers**: [backend/tests/factories/](backend/tests/factories/) - Factory-boy fixtures for test data generation

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
