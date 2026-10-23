# Contrato de la API — Módulo 3 (Ventas)

Versión 1.0 · CU08, CU09, CU10, CU11 · Base URL: `/api`

Mantiene las convenciones de los contratos M1 y M2 (`docs/api/contrato-M1.md`, `docs/api/contrato-M2.md`):
JSON en `camelCase` sin tildes, cabecera `Authorization: Bearer <token>` y el mismo formato estándar de error.

## 1. Convenciones nuevas

- **Fechas sin hora** (fecha de la venta): `AAAA-MM-DD`, por ejemplo `2026-10-03`.
- **Montos** en soles: número JSON con 2 decimales (`6840.00`). En el backend se usan `BigDecimal`, nunca `double`.
- **Cálculos del servidor:** el frontend envía solo producto, cantidad y precio unitario. El backend calcula
  el subtotal de cada ítem, el subtotal de la venta, el IGV y el total. Si el cliente envía esos campos, se ignoran.
  - Subtotal del ítem = `cantidad × precioUnitario`, redondeado a 2 decimales (`HALF_UP`).
  - Subtotal de la venta = suma de los subtotales de los ítems.
  - IGV = `subtotal × 0.18`, redondeado a 2 decimales (`HALF_UP`).
  - Total = `subtotal + igv`.
- **Número de venta:** lo genera el backend con el formato `V-AAAA-NNNN` (año de registro + correlativo con
  4 dígitos como mínimo). Ejemplo: `V-2026-0001`. Es único.
- **Mensaje 404** para ventas: `"No existe una venta con ese identificador."` (código `NO_ENCONTRADO`, el mismo de M2).
- Si un `clienteId` o un `productoId` del **cuerpo** de la petición no existe, responde **400 `VALIDACION`** en ese
  campo, no 404. El 404 se reserva para el recurso de la URL.

## 2. Catálogo de productos (apoyo a CU08)

`GET /api/productos` · Roles: `COMERCIAL`, `GERENCIA`, `ADMIN`

Devuelve solo los productos activos, ordenados por nombre. No se pagina (es un catálogo corto).

**Responde 200 OK:**

```json
[
  {
    "id": 1,
    "codigo": "HIL-PIMA-301",
    "nombre": "Hilo de algodón Pima 30/1",
    "unidadMedida": "KG",
    "precioReferencial": 28.50
  }
]
```

`precioReferencial` sirve para precargar el precio en el formulario; el usuario puede modificarlo.

**Errores:** 401.

## 3. CU08 y CU09 — Registrar venta asociada a un cliente

`POST /api/ventas` · Roles: `COMERCIAL`, `ADMIN` (`GERENCIA` recibe 403)

**Cuerpo:**

```json
{
  "clienteId": 1,
  "fecha": "2026-10-03",
  "observaciones": "Entrega en almacén de Gamarra.",
  "items": [
    { "productoId": 1, "cantidad": 120, "precioUnitario": 28.50 },
    { "productoId": 3, "cantidad": 80, "precioUnitario": 18.90 }
  ]
}
```

**Reglas de validación:**

| Campo | Regla | Mensaje |
|---|---|---|
| `clienteId` | Obligatorio; debe existir (CU09) | "Selecciona un cliente." / "El cliente no existe." |
| `fecha` | Obligatoria; no puede ser futura | "La fecha es obligatoria." / "La fecha no puede ser futura." |
| `observaciones` | Opcional; máximo 300 caracteres | "Las observaciones admiten hasta 300 caracteres." |
| `items` | Entre 1 y 20 ítems | "Agrega al menos un producto." / "Una venta admite hasta 20 productos." |
| `items[i].productoId` | Obligatorio; debe existir y estar activo; sin repetir en la misma venta | "Selecciona un producto." / "El producto no existe." / "El producto está repetido." |
| `items[i].cantidad` | Obligatoria; mayor que 0 y hasta 99 999,99; máximo 2 decimales | "La cantidad debe ser mayor que 0." |
| `items[i].precioUnitario` | Obligatorio; mayor que 0 y hasta 99 999,99; máximo 2 decimales | "El precio debe ser mayor que 0." |

En los errores, `campo` indica la posición del ítem, por ejemplo `items[1].cantidad`.

**Responde 201 Created** con la venta completa (mismo cuerpo que la sección 5) y la cabecera
`Location: /api/ventas/{id}`.

**Errores:** 400 `VALIDACION`, 401, 403 `SIN_PERMISO`.

## 4. CU10 y CU11 — Consultar y filtrar ventas

`GET /api/ventas` · Roles: `COMERCIAL`, `GERENCIA`, `ADMIN`

**Parámetros (todos opcionales):**

| Parámetro | Tipo | Por defecto | Regla |
|---|---|---|---|
| `desde` | fecha | — | Incluye ese día |
| `hasta` | fecha | — | Incluye ese día; si vienen ambos, `desde` ≤ `hasta` |
| `clienteId` | número | — | Solo ventas de ese cliente (CU11) |
| `pagina` | número | `0` | Empieza en 0 |
| `tamano` | número | `8` | Entre 1 y 50 |

Orden: fecha descendente y, a igual fecha, número de venta descendente (las más recientes primero).

Ejemplo: `GET /api/ventas?desde=2026-10-01&hasta=2026-10-31&clienteId=1&pagina=0&tamano=8`

**Responde 200 OK:**

```json
{
  "contenido": [
    {
      "id": 12,
      "numero": "V-2026-0012",
      "fecha": "2026-10-03",
      "clienteId": 1,
      "clienteRazonSocial": "Confecciones Gamarra Andina S.A.C.",
      "tipoCliente": "CONFECCIONISTA",
      "registradoPor": "María Quispe",
      "total": 5819.76
    }
  ],
  "pagina": 0,
  "tamano": 8,
  "totalElementos": 1,
  "totalPaginas": 1,
  "montoTotal": 5819.76
}
```

- `montoTotal` es la suma de `total` de **todas** las ventas que cumplen el filtro (no solo de la página).
- Si no hay resultados: `contenido` vacío, `totalElementos: 0` y `montoTotal: 0.00` (no es un error).
- La pantalla 04 (detalle del cliente) usa este mismo endpoint con `clienteId` y `tamano=5`.

**Errores:** 400 `VALIDACION` (fecha con formato inválido, `desde` > `hasta`, `pagina` < 0 o `tamano` fuera
de 1–50), 401.

## 5. CU10 — Ver detalle de una venta

`GET /api/ventas/{id}` · Roles: `COMERCIAL`, `GERENCIA`, `ADMIN`

**Responde 200 OK:**

```json
{
  "id": 12,
  "numero": "V-2026-0012",
  "fecha": "2026-10-03",
  "cliente": {
    "id": 1,
    "tipoDocumento": "RUC",
    "numeroDocumento": "20601234571",
    "razonSocial": "Confecciones Gamarra Andina S.A.C.",
    "tipoCliente": "CONFECCIONISTA"
  },
  "observaciones": "Entrega en almacén de Gamarra.",
  "items": [
    {
      "productoId": 1,
      "codigo": "HIL-PIMA-301",
      "nombre": "Hilo de algodón Pima 30/1",
      "unidadMedida": "KG",
      "cantidad": 120.00,
      "precioUnitario": 28.50,
      "subtotal": 3420.00
    },
    {
      "productoId": 3,
      "codigo": "HIL-POL-402",
      "nombre": "Hilo poliéster 40/2",
      "unidadMedida": "KG",
      "cantidad": 80.00,
      "precioUnitario": 18.90,
      "subtotal": 1512.00
    }
  ],
  "subtotal": 4932.00,
  "igv": 887.76,
  "total": 5819.76,
  "registradoPor": "María Quispe",
  "fechaRegistro": "2026-10-03T11:15:00"
}
```

**Errores:** 401, 404 `NO_ENCONTRADO`.

## 6. Fuera del alcance de M3

- Editar o anular ventas (no hay `PUT` ni `DELETE`).
- Mantenimiento del catálogo de productos (se carga con la migración `V31`).
- Indicadores y gráficos de ventas: corresponden a M4 (dashboard).