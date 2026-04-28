"""
Rutas para información del sistema (versión, health check, etc).
"""

import os
from flask import Blueprint, jsonify
import sys
from pathlib import Path

# Agregar raíz del proyecto al path para importar version.py
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

system_bp = Blueprint("system", __name__, url_prefix="")


def get_version() -> str:
    """Obtiene la versión actual del proyecto."""
    version_file = Path(__file__).parent.parent.parent / ".version"
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
