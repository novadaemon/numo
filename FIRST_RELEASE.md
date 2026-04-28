# 🚀 Primera Release — Guía Paso a Paso

Esta guía te lleva a través del proceso completo de hacer tu primer release con versionado automático.

---

## 📋 Prequisitos

✅ Proyecto Numo con workflows de CI/CD configurados  
✅ Rama `main` y `develop` existentes en GitHub  
✅ `.version` archivo con versión actual (0.1.0)

---

## 🎯 Objetivo

Hacer un release v0.1.0 con:

- Tag automático en GitHub
- Release notes automáticas
- CI/CD pasando todos los tests

---

## 🔄 Paso 1: Asegurar que develop tiene todos los cambios

```bash
# Checkout a develop
git checkout develop

# Traer cambios si es necesario
git pull origin develop

# Verificar que la versión es correcta
cat .version
# Output: 0.1.0
```

---

## 🔄 Paso 2: Mergear develop a main

```bash
# Checkout a main
git checkout main

# Traer cambios más recientes
git pull origin main

# Mergear develop
git merge develop

# Push a origin
git push origin main
```

**¿Qué sucede automáticamente?**

1. 🤖 **create-version-tag.yml** se activa:
   - Lee `.version` (encuentra 0.1.0)
   - Verifica si tag `v0.1.0` existe (no existe)
   - Crea tag `v0.1.0`
   - Pushea tag a origin

2. 🤖 **create-release.yml** se activa:
   - Lee versión 0.1.0
   - Genera changelog desde commits
   - Crea GitHub Release `v0.1.0`

---

## 🔍 Paso 3: Verificar que todo se ejecutó

### Ver Workflows en Ejecución

1. Ir a GitHub → Tu repositorio
2. Pestaña **Actions**
3. Deberías ver tres workflows ejecutándose:
   - ✅ `CI - Tests and Validation`
   - ✅ `Create Version Tag on Merge to Main`
   - ✅ `Release Automation`

### Ver Tags Credos workflows ejecutándose:

```bash
# En terminal (en tu repo local)
git fetch origin --tags
git tag -l v*
# Output:
# v0.1.0
```

### Ver GitHub Release

1. GitHub → Tu repositorio
2. En la barra lateral → **Releases**
3. Deberías ver `v0.1.0` listado

---

## 📝 Paso 4: Actualizar versión para siguiente desarrollo

Después de la release, actualiza la versión en develop para siguiente desarrollo:

```bash
# Checkout a develop
git checkout develop

# Mergear los cambios de main si es necesario
git merge main

# Bump a siguiente prerelease
python bump_version.py prerelease alpha.1
# Esto crea: 0.1.1-alpha.1

# Commit y push
git add .version frontend/package.json
git commit -m "chore: bump version to 0.1.1-alpha.1"
git push origin develop
```

---

## 🔁 Repetir el Proceso para Siguiente Release

### Para un PATCH release (0.1.1):

```bash
# En develop
python bump_version.py patch  # 0.1.0 → 0.1.1
git add .version frontend/package.json
git commit -m "chore: bump version to 0.1.1"
git push origin develop

# Luego PR a main y mergear
# → Automáticamente: tag v0.1.1 y release ✅
```

### Para un MINOR release (0.2.0):

```bash
# En develop
python bump_version.py minor  # 0.1.0 → 0.2.0
git add .version frontend/package.json
git commit -m "chore: bump version to 0.2.0"
git push origin develop

# Luego PR a main y mergear
# → Automáticamente: tag v0.2.0 y release ✅
```

### Para un MAJOR release (1.0.0):

```bash
# En develop
python bump_version.py major  # 0.1.0 → 1.0.0
git add .version frontend/package.json
git commit -m "chore: bump version to 1.0.0"
git push origin develop

# Luego PR a main y mergear
# → Automáticamente: tag v1.0.0 y release ✅
```

---

## ✅ Checklist para Release

- [ ] Todos los features están en `develop`
- [ ] Todos los tests pasan localmente (`pytest`, `npm run build`)
- [ ] Documentación está actualizada
- [ ] Version bump está hecho (`python bump_version.py ...`)
- [ ] PR a `main` creada
- [ ] PR revisada y aprobada
- [ ] Mergear a `main`
- [ ] Esperar workflows:
  - [ ] `CI - Tests and Validation` ✅
  - [ ] `Create Version Tag on Merge to Main` ✅
  - [ ] `Release Automation` ✅
- [ ] Verificar GitHub Release creada
- [ ] Anunciar release a equipo

---

## 🐛 Troubleshooting

### ❌ Workflow falla con "Permission denied"

**Solución**: GitHub → Settings → Actions → General → Workflow permissions

- Cambiar a "Read and write permissions"

### ❌ Tag no se crea

**Solución**:

1. Verificar `.version` fue modificado en el commit
2. Ejecutar workflow manualmente: Actions → Select workflow → Run workflow

### ❌ Tests fallan en workflow

**Solución**:

1. Ver logs en GitHub Actions
2. Corregir localmente
3. Push nuevamente
4. Workflow se ejecuta automáticamente

### ❌ Release notes están vacías

**Solución**: Es normal si no hay commits desde último tag. Puedes editar manualmente la release en GitHub.

---

## 💡 Tips

- **Commits semánticos**: Usar `feat:`, `fix:`, `chore:` para mejor changelog
- **Draft releases**: La primera vez es buena idea crear release como draft primero
- **Notas manuales**: Siempre puedes editar release notes después en GitHub
- **Rollback**: Si necesitas rollback, puedes eliminar tag: `git tag -d v0.1.0 && git push origin :refs/tags/v0.1.0`

---

## 📚 Referencias

- [VERSIONING.md](VERSIONING.md) — Guía de versionado semántico
- [CI_CD_WORKFLOWS.md](CI_CD_WORKFLOWS.md) — Detalle de workflows
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🎉 Listo

¡Tu primer release está hecho! Los próximos serán aún más automáticos.

**Próximo paso**: Crear más features y repetir el proceso. 🚀
