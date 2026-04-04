# Numo es una aplicación para llevar el registro de los gastos personales

## Arquitectura de desarrollo

Numo está desarrollado con el framework Python **Flask** (https://flask.palletsprojects.com/en/stable/). Como motor de base de datos usa **SQLite**(https://sqlite.org/). El backend consiste en una API REST. El frontend está desarrollado en **React** y **TypeScript**. Se usan las librería **Shadcn** (https://ui.shadcn.com/) para los componentes y Tailwindcss (https://tailwindcss.com/) para la definición de estilos. Los iconos de la aplicación se usan implementando la librería **lucide-react**(https://lucide.dev/guide/react/). Se usa **Vite**(https://vite.dev/) para el build y empaquetado de los assets del front.

## Entorno de desarrollo

Para el entorno de desarrollo se usa **Docker**(https://www.docker.com/) con docker-compose. Se utiliza una imagen de Python que implementa **Gunicorn**(https://gunicorn.org/). El contenedor de la API expone el puerto 8080.
