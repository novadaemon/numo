# Numo - Personal Expense Tracker

Aplicación full-stack para gestionar gastos e ingresos personales.

## 🚀 Inicio Rápido

### Con Docker Backend + Local Frontend (Recomendado)

**Terminal 1: Inicia el Backend**

```bash
# 1. Clona el repositorio
git clone <repository-url>
cd numo

# 2. Copia el archivo de configuración
cp .env.example .env

# 3. Inicia el backend en Docker
docker-compose up

# 4. Ejecuta los seeders para crear la base de datos
docker-compose exec -T backend python seeders/seed.py
```

**Terminal 2: Inicia el Frontend**

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`

### Build de Producción

```bash
# Backend (Docker)
docker-compose build

# Frontend (estáticos)
cd frontend
npm run build
```

## 📁 Estructura del Proyecto

```
numo/
├── backend/                 # API REST (Flask + SQLite)
│   ├── app/                # Código de aplicación
│   ├── tests/              # Tests
│   ├── requirements.txt     # Dependencias Python
│   ├── Dockerfile
│   └── README.md
├── frontend/               # Aplicación React
│   ├── src/               # Código fuente
│   ├── public/            # Archivos estáticos
│   ├── package.json       # Dependencias Node
│   ├── vite.config.ts
│   └── README.md
├── docker-compose.yml      # Orquestación (backend only)
├── .env.example           # Template de variables de entorno
└── CLAUDE.md              # Documentación del proyecto
```

## 🔧 Configuración

Copia `.env.example` a `.env` y ajusta las variables según necesites:

```bash
cp .env.example .env
```

Variables disponibles:

- `BACKEND_PORT` - Puerto del backend (default: 8080)
- `FLASK_ENV` - Ambiente de Flask (development/production)
- `VITE_API_URL` - URL de la API para el frontend (default: http://localhost:8080)

## 🛠️ Tecnología

### Backend

- Python 3.11
- Flask (REST API)
- SQLAlchemy (ORM)
- SQLite (Base de datos)
- Gunicorn (WSGI Server)

### Frontend

- React 18
- TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- Shadcn (Components)

## 📚 Documentación Adicional

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Guía de Desarrollo](./CLAUDE.md)

## 🔧 Configuración

Copia `.env.example` a `.env` y ajusta las variables según necesites:

```bash
cp .env.example .env
```

Variables disponibles:

- `BACKEND_PORT` - Puerto del backend (default: 8080)
- `FRONTEND_PORT` - Puerto del frontend (default: 5173)
- `FLASK_ENV` - Ambiente de Flask (development/production)
- `VITE_API_URL` - URL de la API para el frontend

## 🛠️ Tecnología

### Backend

- Python 3.11
- Flask (REST API)
- SQLAlchemy (ORM)
- SQLite (Base de datos)
- Gunicorn (WSGI Server)

### Frontend

- React 18
- TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- shadcn/ui (UI Components)

## 📚 Documentación Adicional

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Guía de Desarrollo](./AGENTS.md)
- [Versionado Semántico](./VERSIONING.md)
- [CI/CD Workflows](./CI_CD_WORKFLOWS.md)
- [Primera Release](./FIRST_RELEASE.md)

## 📦 Versionado

El proyecto usa **Versionado Semántico 2.0.0**:

```
MAJOR.MINOR.PATCH-PRERELEASE+BUILD
Ejemplo: 0.1.0
```

### Automatización con GitHub Actions

Los workflows automatizan en la rama `main`:

- ✅ Validación automática (tests + lint)
- ✅ Tag automático cuando se mergea
- ✅ Release notes automáticas

Ver [CI_CD_WORKFLOWS.md](./CI_CD_WORKFLOWS.md) para detalles.

### Verificar versión

```bash
# Leer versión actual
python version.py

# Endpoint de API
curl http://localhost:8080/api/system/version
```

### Bump de versión

```bash
python bump_version.py patch   # 0.1.0 → 0.1.1
python bump_version.py minor   # 0.1.0 → 0.2.0
python bump_version.py major   # 0.1.0 → 1.0.0
```

## 📝 Licencia

Proyecto personal.
