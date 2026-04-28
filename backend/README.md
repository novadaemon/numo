# Backend - Numo

Servicio backend de la aplicación Numo. Expone una API REST para gestionar gastos e ingresos.

## Con Docker (Recomendado)

### Iniciar el contenedor

```bash
docker-compose up
```

La API estará disponible en `http://localhost:8080`

### Ejecutar comandos en el contenedor

Todos los comandos deben ejecutarse dentro del contenedor backend usando `docker-compose exec`:

#### Instalar dependencias

```bash
docker-compose exec -T backend pip install -r requirements.txt
```

#### Ejecutar tests

```bash
# Ejecutar todos los tests
docker-compose exec -T backend pytest tests/ -v

# Ejecutar tests con cobertura
docker-compose exec -T backend pytest tests/ -v --cov=app

# Ejecutar un test específico
docker-compose exec -T backend pytest tests/test_debits.py -v
```

#### Ejecutar seeders

```bash
docker-compose exec -T backend python seeders/seed.py
```

#### Acceder al shell interactivo

```bash
docker-compose exec backend bash
```

## Instalación Local

Si prefieres ejecutar la aplicación localmente sin Docker:

1. Crea un entorno virtual:

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instala dependencias:

```bash
pip install -r requirements.txt
```

3. Ejecuta la aplicación:

```bash
flask run
```

La API estará disponible en `http://localhost:5000` (desarrollo)

## API Endpoints

- `GET /health` - Estado del servidor
- `GET /debits` - Listar gastos
- `POST /debits` - Crear gasto
- `GET /debits/:id` - Ver gasto
- `PUT /debits/:id` - Actualizar gasto
- `DELETE /debits/:id` - Eliminar gasto
- `GET /credits` - Listar ingresos
- `POST /credits` - Crear ingreso
- `GET /credits/:id` - Ver ingreso
- `PUT /credits/:id` - Actualizar ingreso
- `DELETE /credits/:id` - Eliminar ingreso
- `GET /categories` - Listar categorías
- `POST /categories` - Crear categoría
- `GET /categories/:id` - Ver categoría
- `PUT /categories/:id` - Actualizar categoría
- `DELETE /categories/:id` - Eliminar categoría
- `GET /places` - Listar lugares
- `POST /places` - Crear lugar
- `GET /places/:id` - Ver lugar
- `PUT /places/:id` - Actualizar lugar
- `DELETE /places/:id` - Eliminar lugar
