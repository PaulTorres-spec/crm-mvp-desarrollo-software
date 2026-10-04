# Contrato de la API — Módulo 1 (Autenticación y Registro de Clientes)

Versión 1.0 · CU01, CU02, CU03, CU04 · Base URL: `/api`

## 1. Convenciones generales

- Formato: JSON (UTF-8). Nombres de campos en `camelCase` y en español sin tildes.
- Fechas y horas: ISO 8601 (`2026-10-04T10:30:00`).
- Autenticación: todas las rutas, salvo `POST /api/auth/login` y `GET /api/health`, requieren
  la cabecera `Authorization: Bearer <token>`.
- Roles: `COMERCIAL`, `GERENCIA`, `ADMIN`.

### Formato estándar de error (todas las respuestas 4xx)

```json
{
  "estado": 400,
  "codigo": "VALIDACION",
  "mensaje": "Hay campos con errores.",
  "errores": [
    { "campo": "numeroDocumento", "mensaje": "El RUC debe tener 11 dígitos." }
  ],
  "fecha": "2026-10-04T10:30:00"
}
```

| Código HTTP | `codigo` | Cuándo |
|---|---|---|
| 400 | `VALIDACION` | Datos con formato inválido o campos obligatorios vacíos (`errores` lista cada campo) |
| 401 | `NO_AUTENTICADO` | Sin token, token vencido o credenciales incorrectas |
| 403 | `SIN_PERMISO` | El rol del usuario no puede usar ese endpoint |
| 409 | `DUPLICADO` | El registro ya existe (por ejemplo, el número de documento) |

---

## 2. CU01 — Iniciar sesión

`POST /api/auth/login` · Público

**Envía:**

```json
{
  "correo": "mquispe@amazonas.com.pe",
  "contrasena": "Clave2026!"
}
```

**Responde 200 OK:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tipo": "Bearer",
  "expiraEn": 28800,
  "usuario": {
    "id": 1,
    "nombre": "María Quispe",
    "correo": "mquispe@amazonas.com.pe",
    "rol": "COMERCIAL"
  }
}
```

`expiraEn` está en segundos (28800 = 8 horas, una jornada laboral).

**Errores:**

- 400 `VALIDACION`: correo vacío o con formato inválido, o contraseña vacía.
- 401 `NO_AUTENTICADO`: "Correo o contraseña incorrectos." (el mismo mensaje en ambos casos,
  para no revelar qué correos existen).

## 3. Usuario de la sesión actual

`GET /api/auth/yo` · Autenticado

Sirve para que el frontend recupere los datos del usuario al recargar la página.

**Responde 200 OK:** el mismo objeto `usuario` del login.
**Errores:** 401 si el token falta o venció.

## 4. CU02 — Cerrar sesión

No tiene endpoint. El token JWT no se guarda en el servidor, así que cerrar sesión consiste en que
el frontend **borre el token** y redirija al login. Si el token vence, el backend responde 401 y el
frontend hace lo mismo.

---

## 5. CU03 — Registrar cliente

`POST /api/clientes` · Roles: `COMERCIAL`, `ADMIN`

**Envía:**

```json
{
  "tipoDocumento": "RUC",
  "numeroDocumento": "20601234571",
  "razonSocial": "Confecciones Gamarra Andina S.A.C.",
  "tipoCliente": "CONFECCIONISTA",
  "personaContacto": "Luis Ccori Paredes",
  "telefono": "987654321",
  "correo": "compras@gamarraandina.pe",
  "direccion": "Jr. Gamarra 1024, int. 305 - La Victoria, Lima"
}
```

**Responde 201 Created** (con cabecera `Location: /api/clientes/15`):

```json
{
  "id": 15,
  "tipoDocumento": "RUC",
  "numeroDocumento": "20601234571",
  "razonSocial": "Confecciones Gamarra Andina S.A.C.",
  "tipoCliente": "CONFECCIONISTA",
  "personaContacto": "Luis Ccori Paredes",
  "telefono": "987654321",
  "correo": "compras@gamarraandina.pe",
  "direccion": "Jr. Gamarra 1024, int. 305 - La Victoria, Lima",
  "registradoPor": "María Quispe",
  "fechaRegistro": "2026-10-04T10:30:00"
}
```

**Errores:** 400 `VALIDACION` (reglas del CU04), 401, 403, 409 `DUPLICADO`.

## 6. CU04 — Validar datos del cliente (reglas)

Se validan en el **backend** (obligatorio) y también en el **frontend** (para avisar antes de enviar).

| Campo | Obligatorio | Regla | Mensaje de error |
|---|---|---|---|
| `tipoDocumento` | Sí | `RUC` o `DNI` | "Selecciona el tipo de documento." |
| `numeroDocumento` | Sí | RUC: 11 dígitos y empieza en 10 o 20. DNI: 8 dígitos | "El RUC debe tener 11 dígitos y empezar en 10 o 20." / "El DNI debe tener 8 dígitos." |
| `numeroDocumento` | — | No puede existir otro cliente con el mismo número | 409: "Ya existe un cliente registrado con este documento." |
| `razonSocial` | Sí | 3 a 150 caracteres | "Este campo es obligatorio." |
| `tipoCliente` | Sí | `CONFECCIONISTA`, `DISTRIBUIDOR` o `INSTITUCIONAL` | "Selecciona el tipo de cliente." |
| `personaContacto` | No | Máximo 100 caracteres | — |
| `telefono` | Sí | 7 a 9 dígitos (sin espacios) | "El teléfono debe tener entre 7 y 9 dígitos." |
| `correo` | No | Formato de correo válido | "Ingresa un correo válido, por ejemplo nombre@empresa.com." |
| `direccion` | No | Máximo 200 caracteres | — |

`registradoPor` y `fechaRegistro` los llena el backend; el frontend no los envía.