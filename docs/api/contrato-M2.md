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

`editadoPor` y