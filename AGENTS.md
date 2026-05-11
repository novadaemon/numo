# AGENTS.md

## Project Overview

**Numo** is a personal expense tracking application. It allows users to record and manage their financial activity, including debits (expenses) and credits (income).

The system is designed as a full-stack application with a REST API backend and a modern frontend.

---

## Tech Stack

### Backend

- Python 3.11 - https://www.python.org/
- Flask (REST API) - https://flask.palletsprojects.com/
- flask-cors (Cross-Origin Resource Sharing)
- SQLAlchemy (ORM) - https://www.sqlalchemy.org/
- Marshmallow (Data validation) - https://marshmallow.readthedocs.io/en/latest/
- SQLite (database) - https://sqlite.org/
- Gunicorn (WSGI server) - https://gunicorn.org/
- pytest (testing framework) - https://docs.pytest.org/
- pytest-flask (Flask testing) - https://pypi.org/project/pytest-flask/
- pytest-cov (coverage reporting) - https://pypi.org/project/pytest-cov/
- factory-boy (test data generation) - https://factoryboy.readthedocs.io/en/stable/

### Frontend

- React - https://react.dev/
- TypeScript - https://www.typescriptlang.org/
- Vite (build tool) - https://vite.dev/
- Tailwind CSS (styling) - https://tailwindcss.com/
- shadcn/ui (UI components) - https://ui.shadcn.com/
- lucide-react (icons) - https://lucide.dev/guide/react/
- Tanstack (tables) - https://tanstack.com/table/v8/docs/guide/filters

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

## Authentication (Basic Auth)

The API is protected with HTTP Basic Authentication using [Flask-HTTPAuth](https://flask-httpauth.readthedocs.io/en/latest/).

### Backend Implementation

- **Credentials**: Stored in environment variables `NUMO_USERNAME` and `NUMO_PASSWORD` (defaults: both `admin`)
- **Auth Module**: [backend/app/http/auth.py](backend/app/http/auth.py) - Handles credential verification
- **Verification**: `@auth.verify_password` callback validates username/password against environment variables
- **Protection**: All endpoints except `GET /version` are protected with `@auth.login_required` decorator
- **Public Endpoint**: `GET /version` (health check) remains public for monitoring

### Frontend Implementation

- **AuthContext**: [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx) - Manages credentials in localStorage
- **LoginModal**: [frontend/src/components/Auth/LoginModal.tsx](frontend/src/components/Auth/LoginModal.tsx) - Modal form for credential entry
- **API Client**: [frontend/src/services/apiClient.ts](frontend/src/services/apiClient.ts) - Automatically includes `Authorization: Basic` header
- **Credentials Storage**: Persisted in localStorage with key `NUMO_AUTH` (format: `{username, password}`)

### Usage

1. **First Load**: User sees LoginModal requesting username/password
2. **Validation**: Frontend validates credentials by attempting GET `/version`
3. **Storage**: Valid credentials are saved to localStorage
4. **Requests**: All subsequent API calls include the Authorization header automatically
5. **401 Handling**: If credentials become invalid, user is prompted to re-login

### Environment Variables

```bash
# Backend
NUMO_USERNAME=admin          # Username for Basic Auth (default: admin)
NUMO_PASSWORD=secret123      # Password for Basic Auth (default: admin)
```

### Testing with cURL

```bash
# Without auth → 401 Unauthorized
curl http://localhost:8080/debits

# With valid auth → 200 OK
curl -H "Authorization: Basic $(echo -n 'admin:secret123' | base64)" http://localhost:8080/debits

# Health check (no auth required)
curl http://localhost:8080/version
```

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
