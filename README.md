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

## 🧪 Tests del Backend

Los tests usan **pytest** y se ejecutan dentro del contenedor del backend (debe estar levantado con `docker-compose up`):

```bash
# Ejecutar toda la suite con reporte de cobertura
docker-compose exec -T backend pytest tests/ -v --cov=app

# Ejecutar un archivo concreto
docker-compose exec -T backend pytest tests/test_debits.py -v

# Ejecutar una clase o un test concreto
docker-compose exec -T backend pytest tests/test_debits.py::TestDebitsEndpoints -v
docker-compose exec -T backend pytest tests/test_debits.py::TestDebitsEndpoints::test_create_debit_valid -v

# Filtrar tests por nombre
docker-compose exec -T backend pytest tests/ -k "pagination" -v

# Reporte de cobertura con líneas no cubiertas
docker-compose exec -T backend pytest tests/ --cov=app --cov-report=term-missing
```

El objetivo es mantener una cobertura de al menos **80%**. Los fixtures están en [backend/tests/conftest.py](./backend/tests/conftest.py) y hay más detalles en [backend/tests/TESTS_GUIDE.md](./backend/tests/TESTS_GUIDE.md).

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
└── AGENTS.md              # Documentación del proyecto
```

## 🛠️ Tecnología

### Backend

- Python 3.11
- Flask (REST API)
- SQLAlchemy (ORM)
- SQLite (Base de datos)
- Gunicorn (WSGI Server, para producción; el contenedor de desarrollo usa el servidor de Flask)

### Frontend

- React 18
- TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- Shadcn (Components)

## 🔧 Configuración

Copia `.env.example` a `.env` y ajusta las variables según necesites:

```bash
cp .env.example .env
```

Variables disponibles:

- `BACKEND_PORT` - Puerto del backend (default: 8080)
- `FRONTEND_PORT` - Puerto del frontend (default: 3000)
- `NUMO_VERSION` - Versión de la aplicación (opcional). Normalmente no se configura manualmente: el backend la obtiene desde `.version`. Si se usa como fallback/inyección (por ejemplo, en Docker), debe mantenerse sincronizada con `.version`
- `APP_ENV` - Ambiente de la aplicación, se devuelve en `GET /version` (development/production; default: production, development en docker-compose)
- `FLASK_DEBUG` - Modo debug de Flask con auto-reload al guardar cambios (`1` activado, `0` desactivado; default: 0). Solo para desarrollo
- `VITE_API_URL` - URL de la API para el frontend
- `NUMO_USERNAME` - Usuario para autenticación Basic Auth (default: admin)
- `NUMO_PASSWORD` - Contraseña para autenticación Basic Auth (default: admin)

## 🔐 Autenticación

La API está protegida con **HTTP Basic Authentication**:

- **Todos los endpoints** requieren autenticación (excepto `GET /version`)
- **Credenciales** se configuran via variables de entorno: `NUMO_USERNAME` y `NUMO_PASSWORD`
- **Frontend** pide las credenciales en la primera carga y las guarda en localStorage
- **Header requerido**: `Authorization: Basic <base64(username:password)>`

### Uso con cURL

```bash
# Sin autenticación → 401 Unauthorized
curl http://localhost:8080/debits

# Con autenticación válida → 200 OK
curl -H "Authorization: Basic $(echo -n 'admin:admin' | base64)" http://localhost:8080/debits

# Health check sin autenticación (siempre funciona)
curl http://localhost:8080/version
```

## 🛠️ Tecnología

### Backend

- Python 3.11
- Flask (REST API)
- SQLAlchemy (ORM)
- SQLite (Base de datos)
- Gunicorn (WSGI Server, para producción; el contenedor de desarrollo usa el servidor de Flask)

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
curl http://localhost:8080/version
```

### Bump de versión

```bash
python bump_version.py patch   # 0.1.0 → 0.1.1
python bump_version.py minor   # 0.1.0 → 0.2.0
python bump_version.py major   # 0.1.0 → 1.0.0
```

## 📝 Licencia

Proyecto personal.
