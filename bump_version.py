#!/usr/bin/env python
"""
Script para hacer bump de la versión semántica del proyecto.

Uso:
    python bump_version.py patch      # 0.1.0 → 0.1.1
    python bump_version.py minor      # 0.1.0 → 0.2.0
    python bump_version.py major      # 0.1.0 → 1.0.0
    python bump_version.py prerelease # 0.1.0 → 0.1.1-alpha.1
    python bump_version.py prerelease beta.2  # 0.1.0 → 0.1.1-beta.2
"""

import sys
from pathlib import Path
from datetime import datetime

# Importar el módulo de versión
sys.path.insert(0, str(Path(__file__).parent))
from version import get_version, get_version_parts


def bump_version(bump_type: str, prerelease_tag: str = None) -> str:
    """Incrementa la versión según el tipo especificado."""
    current = get_version()
    parts = get_version_parts(current)
    
    if bump_type == "major":
        parts["major"] += 1
        parts["minor"] = 0
        parts["patch"] = 0
        parts["prerelease"] = None
        parts["build"] = None
    
    elif bump_type == "minor":
        parts["minor"] += 1
        parts["patch"] = 0
        parts["prerelease"] = None
        parts["build"] = None
    
    elif bump_type == "patch":
        parts["patch"] += 1
        parts["prerelease"] = None
        parts["build"] = None
    
    elif bump_type == "prerelease":
        # Mantener versión actual si no hay prerelease, o incrementar patch
        if parts["prerelease"] is None:
            parts["patch"] += 1
        parts["prerelease"] = prerelease_tag or f"alpha.1"
        parts["build"] = None
    
    else:
        raise ValueError(f"Tipo desconocido: {bump_type}")
    
    # Construir nueva versión
    new_version = f"{parts['major']}.{parts['minor']}.{parts['patch']}"
    if parts["prerelease"]:
        new_version += f"-{parts['prerelease']}"
    if parts["build"]:
        new_version += f"+{parts['build']}"
    
    return new_version


def update_version_file(new_version: str) -> None:
    """Actualiza el archivo .version."""
    version_file = Path(__file__).parent / ".version"
    version_file.write_text(new_version + "\n", encoding="utf-8")
    print(f"✅ Versión actualizada: {new_version}")


def update_frontend_package_json(new_version: str) -> None:
    """Actualiza package.json del frontend con la nueva versión."""
    import json
    
    package_file = Path(__file__).parent / "frontend" / "package.json"
    with open(package_file, "r", encoding="utf-8") as f:
        package_data = json.load(f)
    
    package_data["version"] = new_version
    
    with open(package_file, "w", encoding="utf-8") as f:
        json.dump(package_data, f, indent=2)
    
    print(f"✅ frontend/package.json actualizado")


def main():
    """Punto de entrada principal."""
    if len(sys.argv) < 2:
        print("Uso: python bump_version.py [major|minor|patch|prerelease] [prerelease_tag]")
        print()
        print("Ejemplos:")
        print("  python bump_version.py patch")
        print("  python bump_version.py minor")
        print("  python bump_version.py prerelease beta.1")
        sys.exit(1)
    
    bump_type = sys.argv[1]
    prerelease_tag = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        current_version = get_version()
        print(f"Versión actual: {current_version}")
        
        new_version = bump_version(bump_type, prerelease_tag)
        print(f"Nueva versión: {new_version}")
        
        # Confirmar cambio
        response = input("¿Continuar? (s/n): ").lower()
        if response != "s":
            print("Cancelado.")
            sys.exit(0)
        
        # Actualizar archivos
        update_version_file(new_version)
        update_frontend_package_json(new_version)
        
        print()
        print("🎉 Bump de versión completado exitosamente")
        print()
        print("Próximos pasos:")
        print(f"  1. Revisar cambios: git status")
        print(f"  2. Commit: git commit -m 'chore: bump version to {new_version}'")
        print(f"  3. Tag: git tag -a v{new_version} -m 'Release {new_version}'")
        print(f"  4. Push: git push origin main v{new_version}")
    
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
