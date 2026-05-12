"""
Rutas para información del sistema (versión, health check, etc).
"""

import os
from flask import Blueprint, jsonify
from pathlib import Path
from ..http.auth import auth

system_bp = Blueprint("system", __name__, url_prefix="")


def get_version() -> str:
    """Obtiene la versión actual del proyecto desde backend/.version."""
    # Path from system.py: backend/app/routes/system.py -> backend/.version
    version_file = Path(__file__).parent.parent.parent / ".version"
    if version_file.exists():
        return version_file.read_text(encoding="utf-8").strip()
    return "develop"


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


@system_bp.route("/auth/verify", methods=["GET"])
@auth.login_required
def verify_auth():
    """
    Verifica que las credenciales de autenticación son válidas.
    Requiere Basic Auth. Si se llama exitosamente, las credenciales son válidas.
    
    Returns:
        JSON con confirmación:
        {
            "authenticated": true,
            "message": "Credentials verified"
        }
    """
    return jsonify({
        "authenticated": True,
        "message": "Credentials verified"
    })


@system_bp.route("/auth/verify", methods=["OPTIONS"])
def verify_auth_options():
    """
    Maneja solicitudes OPTIONS para CORS preflight en el endpoint /auth/verify.
    No requiere autenticación.
    """
    return jsonify({}), 200
