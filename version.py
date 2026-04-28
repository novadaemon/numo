"""
Gestiona el versionado semántico del proyecto Numo.
Lee la versión del archivo .version en la raíz del proyecto.
"""

import os
from pathlib import Path

def get_version() -> str:
    """Obtiene la versión actual del proyecto."""
    version_file = Path(__file__).parent / ".version"
    if version_file.exists():
        return version_file.read_text(encoding="utf-8").strip()
    return "0.0.0"

def get_version_parts(version_string: str = None) -> dict:
    """Parsea una versión semántica y retorna sus componentes."""
    if version_string is None:
        version_string = get_version()
    
    # Ejemplo: "1.2.3-beta.1+build.123"
    parts = {"major": 0, "minor": 0, "patch": 0, "prerelease": None, "build": None}
    
    # Separar build metadata
    if "+" in version_string:
        version_string, parts["build"] = version_string.split("+", 1)
    
    # Separar prerelease
    if "-" in version_string:
        version_part, parts["prerelease"] = version_string.split("-", 1)
    else:
        version_part = version_string
    
    # Parsear versión semántica
    try:
        version_nums = version_part.split(".")
        parts["major"] = int(version_nums[0]) if len(version_nums) > 0 else 0
        parts["minor"] = int(version_nums[1]) if len(version_nums) > 1 else 0
        parts["patch"] = int(version_nums[2]) if len(version_nums) > 2 else 0
    except (ValueError, IndexError):
        pass
    
    return parts

if __name__ == "__main__":
    print(f"Numo v{get_version()}")
    print(f"Componentes: {get_version_parts()}")
