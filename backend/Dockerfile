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

# Comando por defecto
CMD gunicorn --bind 0.0.0.0:${BACKEND_PORT} --workers 4 --timeout 120 wsgi:app
