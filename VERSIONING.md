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

### Backend

- **`backend/.version`** - Fuente única de verdad (SSOT) para la versión del backend y proyecto
- **`backend/version.py`** - Script para obtener la versión desde `backend/.version`
- **`backend/bump_version.py`** - Script para bumping de versión

### Frontend

- **`frontend/package.json`** - Versionado independiente del frontend (sincronizado con backend pero gestionado localmente)

### Infraestructura

- **`docker-compose.yml`** - Lee versión como variable de entorno desde backend

---

## 🔄 Flujo de Versionado

### 1️⃣ Desarrollo

Durante el desarrollo, mantén la versión en estado de prerelease:

```bash
# backend/.version
0.1.0-dev.1

# frontend/package.json
{
  "version": "0.1.0-dev.1"
}
```

### 2️⃣ Release Candidato

Antes de producción, prueba con RC:

```bash
# backend/.version
0.1.0-rc.1

# frontend/package.json
{
  "version": "0.1.0-rc.1"
}
```

### 3️⃣ Release Estable

Cuando esté listo para producción:

```bash
# backend/.version
0.1.0

# frontend/package.json
{
  "version": "0.1.0"
}
```

---

## 🛠️ Scripts de Versionado

### Leer la versión actual

```bash
# Desde la carpeta backend
cd backend
python version.py

# Resultado: Numo v0.1.0
```

### Bumping Manual

Edita directamente `backend/.version`:

```bash
echo "0.2.0" > backend/.version
```

### Con Script (Recomendado)

```bash
# Desde la raíz del proyecto
# El script automáticamente actualiza:
#   - backend/.version
#   - frontend/package.json

# Bump PATCH (0.1.0 → 0.1.1)
cd backend && python bump_version.py patch

# Bump MINOR (0.1.0 → 0.2.0)
cd backend && python bump_version.py minor

# Bump MAJOR (0.1.0 → 1.0.0)
cd backend && python bump_version.py major

# Prerelease
cd backend && python bump_version.py prerelease beta
```

---

## 🐳 Docker — Solo para Desarrollo

Docker se utiliza **únicamente para desarrollo local** a través de `docker-compose`. No define una versión propia:

- ✅ Se usa para orquestar servicios localmente
- ✅ No se construyen ni publican imágenes a registros

Para producción, el versionado se gestiona a través de Git tags y GitHub Releases (ver [CI_CD_WORKFLOWS.md](CI_CD_WORKFLOWS.md)).

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
cd frontend
cat package.json | grep version
```

### Backend

```bash
# Leer archivo backend/.version directamente
cat backend/.version

# O usar el script
cd backend && python version.py
```

### API

## 📊 Tabla de Cambios por Versión

| Versión | Tipo  | Cambio                                  |
| ------- | ----- | --------------------------------------- |
| 0.1.0   | MINOR | Feature inicial: dashboard con gráficos |
| 0.1.1   | PATCH | Fix: validación de fechas               |
| 0.2.0   | MINOR | Feature: export de datos                |
| 1.0.0   | MAJOR | API v1 estable, Breaking changes        |

---

## ✅ Checklist para Release

- [ ] Actualizar `backend/.version` a versión final (sin prerelease)
- [ ] Verificar `frontend/package.json` versión actualizada
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
cd backend && python bump_version.py patch  # bump de versión (actualiza backend y frontend)
git add backend/.version frontend/package.json
git commit -m "chore: bump version"
git push origin develop

# 5. PR a main (CI automático ✅)
# 6. Mergear a main → Automáticamente:
#    ✅ Se crea tag v0.1.1 (desde backend/.version)
#    ✅ Se crea GitHub Release
#    ✅ Done!
```

---

## 📝 Próximos Pasos

- [x] Crear script `bump_version.py` para automatizar cambios ✅
- [x] Agregar endpoint `/api/version` en backend ✅
- [x] Integrar versionado con CI/CD ✅
- [x] Separar versionado de backend y frontend con `backend/.version` ✅
- [ ] Crear `CHANGELOG.md` automático desde commits (futuro)
- [ ] Considerar herramientas como semantic-release (futuro)
