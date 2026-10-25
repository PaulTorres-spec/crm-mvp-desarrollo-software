# Contrato de la API — Módulo 2 (Consulta y Edición de Clientes)

Versión 1.0 · CU05, CU06, CU07 · Base URL: `/api`

Mantiene las convenciones del contrato M1 (`docs/api/contrato-M1.md`): JSON en `camelCase` sin tildes,
fechas ISO 8601, cabecera `Authorization: Bearer <token>` y el mismo formato estándar de error.

## 1. Nuevo código de error

| Código HTTP | `codigo` | Cuándo |
|---|---|---|
| 404 | `NO_ENCONTRADO` | No existe un cliente con el `id` indicado |

## 2. CU05 — Buscar cliente

`GET /api/clientes` · Roles: `COMERCIAL`, `GERENCIA`, `ADMIN`

**Parámetros (todos opcionales):**

| Parámetro | Tipo | Por defecto | Regla |
|---|---|---|---|
| `texto` | texto | — | Busca coincidencias parciales en la razón social o el número de documento, sin distinguir mayúsculas |
| `tipoCliente` | texto | — | `CONFECCIONISTA`, `DISTRIBUIDOR` o `INSTITUCIONAL` |
| `pagina` | número | `0` | Empieza en 0 |
| `tamano` | número | `8` | Entre 1 y 50 |

Orden: razón social ascendente.

Ejemplo: `GET /api/clientes?texto=gamarra&tipoCliente=CONFECCIONISTA&pagina=0&tamano=8`

**Responde 200 OK:**

```json
{
  "contenido": [
    {
      "id": 1,
      "tipoDocumento": "RUC",
      "numeroDocumento": "20601234571",
      "razonSocial": "Confecciones Gamarra Andina S.A.C.",
      "tipoCliente": "CONFECCIONISTA",
      "telefono": "987654321",
      "correo": "compras@gamarraandina.pe"
    }
  ],
  "pagina": 0,
  "tamano": 8,
  "totalElementos": 1,
  "totalPaginas": 1
}
```

Si no hay resultados: `contenido` vacío y `totalElementos: 0` (no es un error).

**Errores:** 400 `VALIDACION` (`tipoCliente` inválido, `pagina` < 0 o `tamano` fuera de 1–50), 401.

## 3. CU06 — Ver detalle del cliente

`GET /api/clientes/{id}` · Roles: `COMERCIAL`, `GERENCIA`, `ADMIN`

**Responde 200 OK:**

```json
{
  "id": 1,
  "tipoDocumento": "RUC",
  "numeroDocumento": "20601234571",
  "razonSocial": "Confecciones Gamarra Andina S.A.C.",
  "tipoCliente": "CONFECCIONISTA",
  "personaContacto": "Luis Ccori Paredes",
  "telefono": "987654321",
  "correo": "compras@gamarraandina.pe",
  "direccion": "Jr. Gamarra 1024, int. 305 - La Victoria, Lima",
  "registradoPor": "María Quispe",
  "fechaRegistro": "2026-10-07T10:30:00",
  "editadoPor": null,
  "fechaEdicion": null
}
```

`editadoPor` y `fechaEdicion` son `null` mientras nadie haya editado al cliente.

**Errores:** 401, 404 `NO_ENCONTRADO`.

## 4. CU07 — Editar cliente

`PUT /api/clientes/{id}` · Roles: `COMERCIAL`, `ADMIN` (`GERENCIA` recibe 403)

El **tipo y el número de documento no se pueden modificar** (pantalla 07). Si el JSON los incluye, se ignoran.

**Cuerpo:**

```json
{
  "razonSocial": "Distribuidora Textil del Norte E.I.R.L.",
  "tipoCliente": "DISTRIBUIDOR",
  "personaContacto": "Rosa Huamán Torres",
  "telefono": "987654321",
  "correo": "ventas@textilnorte.pe",
  "direccion": "Av. España 1450 - Trujillo, La Libertad"
}
```

**Reglas:** las mismas del CU04 (contrato M1, sección 6) para los campos editables.

| Campo | Regla | Mensaje |
|---|---|---|
| `razonSocial` | Obligatoria; 3 a 150 caracteres | "Este campo es obligatorio." / "La razón social debe tener entre 3 y 150 caracteres." |
| `tipoCliente` | Obligatorio; `CONFECCIONISTA`, `DISTRIBUIDOR` o `INSTITUCIONAL` | "Selecciona el tipo de cliente." |
| `personaContacto` | Opcional; máximo 100 caracteres | "La persona de contacto puede tener como máximo 100 caracteres." |
| `telefono` | Obligatorio; 7 a 9 dígitos (se quitan los espacios) | "Ingresa el teléfono." / "El teléfono debe tener entre 7 y 9 dígitos." |
| `correo` | Opcional; formato válido; máximo 120 caracteres | "Ingresa un correo válido, por ejemplo nombre@empresa.com." |
| `direccion` | Opcional; máximo 200 caracteres | "La dirección puede tener como máximo 200 caracteres." |

Los textos se recortan (espacios al inicio y al final); un campo opcional vacío se guarda como `null`.

**Responde 200 OK** con el detalle completo (mismo cuerpo de la sección 3), con `editadoPor` = usuario del token y `fechaEdicion` = fecha y hora del cambio.

**Errores:** 400 `VALIDACION`, 401, 403 `SIN_PERMISO`, 404 `NO_ENCONTRADO`.

## 5. Permisos del módulo

| Endpoint | COMERCIAL | GERENCIA | ADMIN |
|---|---|---|---|
| `GET /api/clientes` | ✅ | ✅ | ✅ |
| `GET /api/clientes/{id}` | ✅ | ✅ | ✅ |
| `PUT /api/clientes/{id}` | ✅ | ❌ 403 | ✅ |

## 6. Limitaciones conocidas

- Si dos usuarios editan el mismo cliente al mismo tiempo, se guarda el último cambio (no hay control de versiones).
- El documento no se puede corregir: un cliente mal registrado debe registrarse de nuevo.

> Secciones 3 (final) a 6 completadas el 25/10/2026: en la versión fusionada en el PR #16 el texto se cortó al pegarlo.
