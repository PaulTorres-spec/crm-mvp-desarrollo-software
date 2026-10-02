# Guía de contribución

Reglas para trabajar en el repositorio del CRM MVP de Textil El Amazonas. Son pocas y valen para todo el equipo. El detalle completo está en `Plan_Git_GitHub_CRM.md`.

## Flujo de trabajo (GitHub Flow)

1. `main` es la única rama permanente y **siempre debe funcionar**. Nadie hace commit directo a `main`.
2. **Una tarea = una rama = un Pull Request (PR).** Las ramas son cortas (2 a 4 días) y nacen siempre de un `main` actualizado.
3. Cuando el PR se aprueba y el CI está en verde, se fusiona con **Squash and merge** y se borra la rama.

## Nombres de rama

Formato: `tipo/RFxx-descripcion-corta`, en minúsculas y con guiones.

| Prefijo | Para qué |
|---|---|
| `feature/` | Funcionalidad de un requisito (RF) |
| `fix/` | Corregir un error |
| `chore/` | Configuración, dependencias, infraestructura |
| `docs/` | Documentación |
| `test/` | Agregar pruebas |

Ejemplos: `feature/RF02-registro-clientes-backend`, `fix/RF05-total-venta`, `chore/ci-github-actions`.

## Mensajes de commit

Usamos **Conventional Commits**: `tipo(alcance): descripción`. Cuando aplique, se menciona el caso de uso al final.

```
feat(RF02): registrar cliente [CU03]
fix(RF05): corregir total de venta [CU08]
chore: agregar dependencia JPA
docs: especificacion CU03
```

Reglas prácticas:

- Un commit por tema, pequeño y fácil de revisar.
- El título en una línea; el porqué, en el cuerpo.
- Sin tildes ni eñes en los mensajes si usas la consola de Windows (se corrompen).

## Ciclo de cada tarea

```powershell
# 1. Partir de main actualizado
git switch main
git pull

# 2. Crear la rama de la tarea
git switch -c feature/RF02-registro-clientes-backend

# 3. Trabajar y guardar en commits pequeños
git add <archivos>
git commit -m "feat(RF02): crear entidad Cliente [CU03]"

# 4. Subir la rama
git push -u origin feature/RF02-registro-clientes-backend
```

Después, en GitHub:

1. Abrir el PR hacia `main` y completar la plantilla.
2. En el PR, enlazar el Issue del caso de uso con **`Refs #N`** (no `Closes`). El Issue se cierra cuando el CU queda **Validado**.
3. Pedir revisión a otra persona.
4. Con 1 aprobación y los checks `Backend CI` y `Frontend CI` en verde, hacer **Squash and merge**.
5. Revisar el campo **Commit message** antes de confirmar: ese texto queda en el historial.
6. Borrar la rama y limpiar el repositorio local:

```powershell
git switch main
git pull
git fetch --prune
git branch -D feature/RF02-registro-clientes-backend
```

## Reglas del Pull Request

- Todo PR necesita **1 aprobación de alguien que no sea el autor**.
- Los checks de CI tienen que estar en verde.
- **Nadie valida un CU que ayudó a codificar.**
- Los cambios de dependencias (`pom.xml`, `package.json`) van en un PR propio (`chore/...`).

## Secretos

**Nunca** se suben claves, tokens ni contraseñas reales.

- Cada persona tiene su `backend/.env` local, que Git ignora.
- `backend/.env.example` es la plantilla pública: se copia a `.env` y se pone la clave propia.
- Antes de cada commit, revisa `git status`: `.env` no debe aparecer.

## Migraciones de base de datos (Flyway)

- Los archivos van en `backend/src/main/resources/db/migration` con el formato `V<numero>__<descripcion>.sql`.
- Cada módulo usa un rango de números para evitar choques: Infra V1–V9, M1 V10–V19, M2 V20–V29, M3 V30–V39, M4 V40–V49.
- Una migración ya fusionada **nunca se edita**; se crea una nueva.

## Preparar el entorno

- Java 21, Node 24 y PostgreSQL 16.
- Base `crm_db` y usuario `crm`. Backend: `cd backend`, copiar `.env.example` a `.env`, poner la clave y ejecutar `./mvnw spring-boot:run`.
- Frontend: `cd frontend`, `npm install` y `npm run dev`.

## Cierre de módulo (línea base)

Un módulo se cierra con un tag anotado (`LB-M1` … `LB-M4`) solo si cumple los criterios de aceptación definidos en el plan: código probado, validado y aceptado, documentación mínima, sin errores críticos pendientes y auditoría de QA hecha.