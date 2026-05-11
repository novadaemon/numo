"""
Rutas para información del sistema (versión, health check, etc).
"""

import os
from flask import Blueprint, jsonify, request
import sys
from pathlib import Path
from functools import wraps
from ..http.auth import auth

# Agregar raíz del proyecto al path para importar version.py
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

system_bp = Blueprint("system", __name__, url_prefix="")


def get_version() -> str:
    """Obtiene la versión actual del proyecto."""
    version_file = Path(__file__).parent.parent.parent / ".version"
    if version_file.exists():
        return version_file.read_text(encoding="utf-8").strip()
    return os.getenv("NUMO_VERSION", "0.0.0")


def auth_required_except_options(f):
    """Decorador que requiere autenticación excepto para solicitudes OPTIONS (CORS preflight)."""
    protected = auth.login_required(f)

    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Permitir solicitudes OPTIONS sin autenticación (CORS preflight)
        if request.method == "OPTIONS":
            return f(*args, **kwargs)
        # Para otros métodos, requerir autenticación
        return protected(*args, **kwargs)
    return decorated_function


@system_bp.route("/version", methods=["GET"])
def get_system_version():
    """
    Obtiene la versión del sistema.
    
    Returns:
        JSON con información de versión:
        {
            "version": "0.1.0",
            "name": "numo",
            "environment": "development"
        }
    """
    return jsonify({
        "version": get_version(),
        "name": "numo",
        "environment": os.getenv("FLASK_ENV", "production")
    })


@system_bp.route("/auth/verify", methods=["GET", "OPTIONS"])
@auth_required_except_options
def verify_auth():
    """
    Verifica que las credenciales de autenticación son válidas.
    Requiere Basic Auth. Si se llama exitosamente, las credenciales son válidas.
    
    Soporta solicitudes OPTIONS para CORS preflight sin autenticación.
    
    Returns:
        JSON con confirmación:
        {
            "authenticated": true,
            "message": "Credentials verified"
        }
    """
    # Manejar solicitud OPTIONS (preflight)
    if request.method == "OPTIONS":
        return jsonify({}), 200
    
    return jsonify({
        "authenticated": True,
        "message": "Credentials verified"
    })
