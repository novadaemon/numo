FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt requirements-dev.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt

# Copiar código de la aplicación
COPY . .

# Variable de entorno para el puerto
ENV BACKEND_PORT=8080

# Exponer puerto
EXPOSE ${BACKEND_PORT}

# Comando por defecto - Flask en modo desarrollo con auto-reload
CMD python -m flask --app wsgi:app run --host=0.0.0.0 --port=${BACKEND_PORT}
