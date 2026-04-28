# 🤖 Automatización con GitHub Actions

Este documento describe los workflows de CI/CD automáticos configurados para el proyecto Numo.

---

## 📋 Workflows Disponibles

### 1. **validation.yml** — Validación Continua

**Trigger**: Push a `main`, PR abierto a `main`

```yaml
Event: push/pull_request → main
├─ Backend Tests (pytest)
│  ├─ Instalar dependencias
│  ├─ Correr tests
│  └─ Generar coverage
└─ Frontend Lint (eslint)
   ├─ Instalar dependencias
   └─ Ejecutar linter
```

**Requisito**: Todos deben pasar ✅

---

### 2. **create-version-tag.yml** — Crear Tags de Versión

**Trigger**: Push a `main` con cambios en `.version`

```yaml
Event: push → main (archivo .version modificado)
├─ Leer versión de .version
├─ Verificar si tag existe
└─ Crear y pushear tag v{VERSION}
```

**Ejemplo**:

```bash
# Cuando hagas merge a main con .version = 0.1.0
# Automáticamente se crea tag: v0.1.0
git push origin main
# ↓
# GitHub Actions crea tag v0.1.0 ✅
```

---

### 3. **create-release.yml** — Crear GitHub Release

**Trigger**: PR merged a `main`

```yaml
Event: pull_request → merged → main
├─ Leer versión
├─ Generar changelog desde commits
└─ Crear GitHub Release
```

**Resultado**:

- Release en GitHub con notas de cambios automáticas
- Visible en: GitHub → Releases

---

## 🔄 Flujo de Desarrollo Recomendado

### Fase 1: Desarrollo en Feature Branch

```bash
git checkout -b feat/nueva-funcionalidad

# Hacer cambios
git add .
git commit -m "feat: descripción de cambio"
git push origin feat/nueva-funcionalidad
```

### Fase 2: Merge a Develop

```bash
git checkout develop
git merge feat/nueva-funcionalidad
git push origin develop

# Sin validación automática (solo en main)
```

### Fase 3: Preparar Release

````bash
# En rama develop
python bump_version.py patch
# Esto actualiza: .version y frontend/package.json

git add .version frontend/package.json
git commit -m "chore: bump version to 0.1.1"
git push origin develop
``🤖 validation.yml se ejecuta automáticamente
- ✅ Si tests y lint pasan

### Fase 4: PR a Main (Release)
- Crear PR: `develop → main`
- ✅ Si todo está listo, se puede mergear

### Fase 5: Merge a Main — Automático ✅
```bash
# Cuando mergeas a main
git checkout main
git merge develop
git push origin main

# Automáticamente:
# 1. create-version-tag.yml crea tag v0.1.1 ✅
# 2. create-release.yml crea GitHub Release ✅
````

---

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    FEATURE DEVELOPMENT                      │
│  git checkout -b feat/nueva-feature                         │
│  ↓ commits (feat: ..., fix: ..., etc)                       │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│  🤖 validation.yml: Tests ✅ + Lint ✅                      │
│  Squash/merge feature branch                                │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│                    VERSION BUMP                             │
│  python bump_version.py patch  → 0.1.1                      │
│  git commit -m "chore: bump version"                        │
│  git push origin develop                                    │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│                    PULL REQUEST → MAIN                      │
│  🤖 validation.yml: Tests ✅ + Lint ✅                      │
│  ✅ Ready to merge? → Mergear                               │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│                    MERGE TO MAIN (RELEASE)                  │
│  🤖 create-version-tag.yml  → Crea tag v0.1.1 ✅           │
│  🤖 create-release.yml      → Crea GitHub Release ✅        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Monitorear Workflows

### En GitHub Web

1. Ir a tu repositorio
2. Pestaña **Actions** en la parte superior
3. Ver workflows en ejecución
4. Clickear para ver detalles y logs

### Campos a Revisar

- **Status**: ✅ Success o ❌ Failed
- **Commit**: Qué commit generó la ejecución
- **Logs**: Detalles de qué falló

### Acciones si Falla

1. Revisar logs del workflow
2. Identificar qué falló
3. Corregir en feature branch
4. Push nuevamente
5. Workflow se ejecuta automáticamente

---

## 🛠️ Customizar Workflows

### Deshabilitar un Workflow

- En `.github/workflows/`, renombrar archivo o cambiar `on:`
- O desde GitHub: Actions → Seleccionar workflow → Disable

### Añadir Notificaciones

Edita el workflow YAML:

```yaml
- name: Send Slack notification
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

### Agregar Secrets (para APIs)

- GitHub → Settings → Secrets and variables → Actions
- Crear new secret (ej: SLACK_WEBHOOK)
- Usar en workflow: `${{ secrets.SLACK_WEBHOOK }}`

---

## ⚙️ Configuración Actual

### Branch Protection Rules

Se recomienda configurar para `main`:

1. GitHub → Settings → Branches
2. Add rule for `main`
3. Habilitar:
   - ✅ Require branches to be up to date

---

## 📝 Conventional Commits

Para que el changelog automático funcione correctamente, usa:

```bash
# Feature (bump MINOR)
git commit -m "feat: descripción de nueva característica"

# Bug fix (bump PATCH)
git commit -m "fix: descripción del bug que se corrigió"

# Breaking change (bump MAJOR)
git commit -m "feat!: descripción del cambio incompatible"

# Other types (no afectan versión en changelog)
git commit -m "docs: actualizar documentación"
git commit -m "style: formatear código"
git commit -m "test: agregar tests"
git commit -m "chore: actualizar dependencias"
```

---

## 🚨 Troubleshooting

### Workflow no se ejecuta

- [ ] Verificar que el evento trigger coincida (`on: push, branches: [main]`)
- [ ] Verificar que haya cambios en los paths monitoreados
- [ ] Ir a Actions → Re-run workflow

### Tag no se crea

- [ ] Verificar `.version` fue modificado en commit
- [ ] Verificar permisos del token (GITHUB_TOKEN tiene acceso)
- [ ] Manual: `git tag -a v0.1.0 -m "Release" && git push origin v0.1.0`

---

## 💡 Tips

- Los workflows están en `.github/workflows/` — todas las ramas pueden verlos
- El archivo `.github/workflows/*.yml` debe estar en `main` para que se ejecute
- GitHub Actions es gratuito para repos públicos
- Los logs se guardan por 90 días

---

## 📚 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
