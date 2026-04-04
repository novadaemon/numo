# Backend - Numo

Servicio backend de la aplicación Numo. Expone una API REST para gestionar gastos e ingresos.

## Con Docker (Recomendado)

```bash
docker-compose up
```

La API estará disponible en `http://localhost:8080`

## Instalación Local

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
- `GET /credits` - Listar ingresos
- `POST /credits` - Crear ingreso
- `GET /categories` - Listar categorías
- `GET /places` - Listar lugares
