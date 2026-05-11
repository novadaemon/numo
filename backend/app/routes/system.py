"""
Rutas para información del sistema (versión, health check, etc).
"""

import os
from flask import Blueprint, jsonify, request
from pathlib import Path
from ..http.auth import verify_password

system_bp = Blueprint("system", __name__, url_prefix="")


def get_version() -> str:
    """Obtiene la versión actual del proyecto."""
    version_file = Path(__file__).parent.parent.parent.parent / ".version"
    if version_file.exists():
        return version_file.read_text(encoding="utf-8").strip()
    return os.getenv("NUMO_VERSION", "0.0.0")


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
    # Permitir solicitudes OPTIONS sin autenticación (CORS preflight)
    if request.method == "OPTIONS":
        return jsonify({}), 200
    
    # Para GET, verificar autenticación obteniendo credenciales del header
    auth_header = request.authorization
    
    # Si no hay credenciales en los headers
    if not auth_header:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Verificar si las credenciales son válidas usando la función callback
    username = auth_header.username
    password = auth_header.password
    
    if not verify_password(username, password):
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify({
        "authenticated": True,
        "message": "Credentials verified"
    })
