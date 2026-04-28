# GitHub Workflows para Numo

Este directorio contiene los workflows de CI/CD automáticos para el proyecto Numo.

## 📋 Workflows

### `validation.yml`
**Validación continua** de backend y frontend.

- Ejecuta tests backend (pytest con coverage)
- Valida linting frontend (eslint)

**Trigger**: `push` a `main`, `pull_request` abierto a `main`  
**Requisito**: Debe pasar antes de mergear a main

### `create-version-tag.yml`
**Creación automática de tags** cuando se mergea a `main`.

- Lee versión de `.version`
- Verifica si tag ya existe
- Crea tag `v{VERSION}` en GitHub

**Trigger**: `push` a `main` con cambios en `.version`  
**Resultado**: Tag automático, no requiere intervención

### `create-release.yml`
**Creación automática de releases** cuando se mergea a `main`.

- Lee versión de `.version`
- Genera changelog desde commits
- Crea GitHub Release con notas
Automáticamente: `validation.yml` corre tests y lint ✅
3. Mergear a `develop`
4. Bump versión: `python bump_version.py patch`
5. PR a `main` → Automáticamente: `validation.yml` corre nuevamente ✅
6. Mergear a `main` → Automáticamente:
   - ✅ Tag creado
   - ✅ Release creada

**Todos los cambios están validados antes de mergear
1. Hacer features en rama feature
2. Mergear a `develop`
3. Bump versión: `python bump_version.py patch`
4. PR a `main` → Mergear
5. Automáticamente:
   - ✅ Tag creado
   - ✅ Release creada

**No necesitas hacer nada manualmente para tags y releases.**

---

## 📚 Documentación Completa

- [VERSIONING.md](../VERSIONING.md) — Versionado semántico
- [CI_CD_WORKFLOWS.md](../CI_CD_WORKFLOWS.md) — Detalles de workflows
- [FIRST_RELEASE.md](../FIRST_RELEASE.md) — Guía paso a paso

---

## ⚙️ Configuración Recomendada

### Branch Protection Rules (main)

1. GitHub → Settings → Branches → Add rule
2. Aplicar a: `main`
3. Habilitar:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

---

## 🔐 Permisos

Los workflows usan `GITHUB_TOKEN` con permisos automáticos.

Para agregar integraciones (Slack, Discord, etc), agregar secrets:
1. GitHub → Settings → Secrets and variables → Actions
2. New secret
3. Usar en workflows: `${{ secrets.NOMBRE_SECRET }}`

---

## 💡 Tips

- Workflows se ejecutan en paralelo automáticamente
- Logs disponibles por 90 días
- Puedes re-ejecutar manualmente desde GitHub → Actions
- Los workflow files están en YAML, fáciles de customizar

---

**Versión de workflows**: 1.0.0  
**Compatible con**: Numo 0.1.0+
