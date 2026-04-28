# 📦 Versionado Semántico en Numo

## 📋 Estructura de Versión

El proyecto Numo utiliza **Versionado Semántico 2.0.0** para garantizar compatibilidad y claridad.

```
MAJOR.MINOR.PATCH-PRERELEASE+BUILD
Ejemplo: 1.2.3-beta.1+20260428
```

### Componentes

| Componente     | Descripción                        | Ejemplo                                      |
| -------------- | ---------------------------------- | -------------------------------------------- |
| **MAJOR**      | Breaking changes (incompatibles)   | Cambio en estructura de API, migración de BD |
| **MINOR**      | Nuevas características compatibles | Nuevo endpoint, nuevo campo opcional         |
| **PATCH**      | Bug fixes y parches                | Fix de validación, mejora de performance     |
| **PRERELEASE** | Versión no lista para producción   | `alpha`, `beta.1`, `rc.2`                    |
| **BUILD**      | Metadata de construcción           | Fecha, commit hash                           |

---

## 📁 Archivos de Versión

- **`.version`** - Fuente única de verdad (SSOT) para la versión
- **`backend/setup.py`** - Lee versión desde `.version`
- **`frontend/package.json`** - Sincronizado con `.version`
- **`docker-compose.yml`** - Lee versión como variable de entorno

---

## 🔄 Flujo de Versionado

### 1️⃣ Desarrollo

Durante el desarrollo, mantén la versión en estado de prerelease:

```bash
# .version
0.1.0-dev.1
```

### 2️⃣ Release Candidato

Antes de producción, prueba con RC:

```bash
# .version
0.1.0-rc.1
```

### 3️⃣ Release Estable

Cuando esté listo para producción:

```bash
# .version
0.1.0
```

---

## 🛠️ Scripts de Versionado

### Leer la versión actual

```bash
# Desde la raíz del proyecto
python version.py

# Resultado: Numo v0.1.0
```

### Bumping Manual

Edita directamente `.version`:

```bash
echo "0.2.0" > .version
```

### Con Script (Recomendado)

```bash
# Bump PATCH (0.1.0 → 0.1.1)
python bump_version.py patch

# Bump MINOR (0.1.0 → 0.2.0)
python bump_version.py minor

# Bump MAJOR (0.1.0 → 1.0.0)
python bump_version.py major

# Prerelease
python bump_version.py prerelease beta
```

---

## 🐳 Docker

### Usar versión en producción

```bash
# En docker-compose.yml la versión se inyecta automáticamente
NUMO_VERSION=0.1.0 docker-compose up

# En el backend, accede via:
import os
version = os.getenv('NUMO_VERSION', '0.0.0')
```

### Build con versión etiquetada

```bash
docker build -t numo:0.1.0 .
docker build -t numo:latest .
```

---

## 📝 Git & Commits

### Convención de Commits

Usa **Conventional Commits** para correlacionar cambios con versiones:

```bash
# Patch (0.1.0 → 0.1.1)
git commit -m "fix: handle null category names"

# Minor (0.1.0 → 0.2.0)
git commit -m "feat: add expense export to CSV"

# Major (0.1.0 → 1.0.0)
git commit -m "feat!: redesign API authentication"
```

### Tags de Versión

```bash
# Crear tag después de release
git tag -a v0.1.0 -m "Release version 0.1.0"
git push origin v0.1.0

# Listar tags
git tag -l
```

---

## 🔍 Verificar Versiones

### Frontend

```bash
npm run version
# o
cat ../VERSION
```

### Backend

```bash
python -c "from app import __version__; print(__version__)"
# o
python version.py
```

### API

Futuro: Agregar endpoint `/api/version` para verificar versión del backend.

---

## 📊 Tabla de Cambios por Versión

| Versión | Tipo  | Cambio                                  |
| ------- | ----- | --------------------------------------- |
| 0.1.0   | MINOR | Feature inicial: dashboard con gráficos |
| 0.1.1   | PATCH | Fix: validación de fechas               |
| 0.2.0   | MINOR | Feature: export de datos                |
| 1.0.0   | MAJOR | API v1 estable, Breaking changes        |

---

## ✅ Checklist para Release

- [ ] Actualizar `.version` a versión final (sin prerelease)
- [ ] Revisar `CHANGELOG.md` (crear si no existe)
- [ ] Ejecutar tests: `docker-compose exec -T backend pytest tests/ -v`
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Build docker: `docker-compose build`
- [ ] Crear tag git: `git tag -a v0.1.0 -m "Release 0.1.0"`
- [ ] Push a repositorio: `git push origin v0.1.0`
- [ ] Deploy a producción

---

## 🤖 GitHub Actions — Automatización Completa

El proyecto incluye workflows de CI/CD que automatizan:

✅ **Crear tags** cuando se mergea a `main`  
✅ **Crear GitHub Releases** automáticamente  
✅ **Validar tests** antes de mergear  
✅ **Linter y build** frontend/backend

**→ Ver [CI_CD_WORKFLOWS.md](CI_CD_WORKFLOWS.md) para detalles completos**

---

## 🚀 Flujo Simplificado

```bash
# 1. Desarrollo en feature branch
git checkout -b feat/nueva-funcionalidad
git commit -m "feat: descripción"
git push origin feat/nueva-funcionalidad

# 2. PR a develop (CI automático ✅)
# 3. Mergear a develop

# 4. Preparar release
python bump_version.py patch  # bump de versión
git push origin develop

# 5. PR a main (CI automático ✅)
# 6. Mergear a main → Automáticamente:
#    ✅ Se crea tag v0.1.1
#    ✅ Se crea GitHub Release
#    ✅ Done!
```

---

## 📝 Próximos Pasos

- [x] Crear script `bump_version.py` para automatizar cambios ✅
- [x] Agregar endpoint `/api/version` en backend ✅
- [x] Integrar versionado con CI/CD ✅
- [ ] Crear `CHANGELOG.md` automático desde commits (futuro)
- [ ] Considerar herramientas como semantic-release (futuro)
