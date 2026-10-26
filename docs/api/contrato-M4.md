# Contrato de la API — Módulo 4 (Dashboard)

Versión 1.0 · CU12, CU13, CU14 · Base URL: `/api`

Mantiene las convenciones de los contratos M1, M2 y M3 (`docs/api/contrato-M1.md` … `contrato-M3.md`):
JSON en `camelCase` sin tildes, cabecera `Authorization: Bearer <token>`, fechas `AAAA-MM-DD`, montos en soles
con 2 decimales (`BigDecimal` en el backend) y el mismo formato estándar de error.

## 1. Convenciones nuevas

- **Periodo:** el backend solo recibe dos fechas, `desde` y `hasta`, y ambas **incluyen ese día**. Los botones
  de la pantalla 02 (Hoy, Este mes, Trimestre, Año) los convierte el **frontend** en `desde`/`hasta`:

  | Botón | `desde` | `hasta` | Ejemplo (hoy = 26/10/2026) |
  |---|---|---|---|
  | Hoy | hoy | hoy | `2026-10-26` – `2026-10-26` |
  | Este mes | día 1 del mes | último día del mes | `2026-10-01` – `2026-10-31` |
  | Trimestre | día 1 del trimestre calendario | último día del trimestre | `2026-10-01` – `2026-12-31` |
  | Año | 1 de enero | 31 de diciembre | `2026-01-01` – `2026-12-31` |
  | Rango | elegido por el usuario | elegido por el usuario | — |

- **Periodo anterior** (para el texto «+8 % frente al periodo anterior»): tiene **la misma cantidad de días** y
  termina el día antes de `desde`.
  - `dias = hasta − desde + 1`
  - `anterior.hasta = desde − 1 día` · `anterior.desde = desde − dias`
  - Ejemplos: Hoy (26/10) → 25/10 – 25/10 · Este mes (01/10 – 31/10, 31 días) → 31/08 – 30/09.
- **Ventas del periodo:** se cuentan por la **fecha de la venta** (`venta.fecha`), no por la fecha en que se
  registró en el sistema.
- **Clientes del periodo:** se cuentan por `cliente.fecha_registro` (fecha y hora): un cliente entra en el periodo
  si `fecha_registro` ≥ `desde 00:00` y < `(hasta + 1 día) 00:00`.
- **Porcentajes:** el backend devuelve las cifras del periodo anterior y el **frontend** calcula la variación:
  `(actual − anterior) / anterior × 100`, con 1 decimal. Si el valor anterior es 0, no se muestra porcentaje
  (texto: «Sin ventas en el periodo anterior»).
- Sin migraciones: M4 solo hace consultas agregadas (`COUNT`, `SUM`, `GROUP BY`) sobre las tablas de M1–M3.

## 2. CU12, CU13 y CU14 — Ver indicadores del periodo

`GET /api/dashboard` · Roles: `COMERCIAL`, `GERENCIA`, `ADMIN`

**Parámetros:**

| Parámetro | Tipo | Por defecto | Regla |
|---|---|---|---|
| `desde` | fecha | día 1 del mes actual | Se envían las dos fechas o ninguna |
| `hasta` | fecha | último día del mes actual | `desde` ≤ `hasta`; el periodo admite hasta 366 días; puede ser futura |

Ejemplo: `GET /api/dashboard?desde=2026-10-01&hasta=2026-10-31`

**Responde 200 OK:**

```json
{
  "desde": "2026-10-01",
  "hasta": "2026-10-31",
  "clientes": {
    "total": 248,
    "nuevosEnPeriodo": 12,
    "porTipo": [
      { "tipoCliente": "CONFECCIONISTA", "cantidad": 172 },
      { "tipoCliente": "DISTRIBUIDOR", "cantidad": 51 },
      { "tipoCliente": "INSTITUCIONAL", "cantidad": 25 }
    ]
  },
  "ventas": {
    "cantidad": 186,
    "montoTotal": 412580.00,
    "anterior": {
      "desde": "2026-08-31",
      "hasta": "2026-09-30",
      "cantidad": 172,
      "montoTotal": 391442.13
    }
  },
  "ventasPorMes": [
    { "mes": "2026-05", "cantidad": 128, "montoTotal": 268040.00 },
    { "mes": "2026-06", "cantidad": 141, "montoTotal": 301215.50 },
    { "mes": "2026-07", "cantidad": 137, "montoTotal": 289380.00 },
    { "mes": "2026-08", "cantidad": 159, "montoTotal": 342110.40 },
    { "mes": "2026-09", "cantidad": 175, "montoTotal": 391442.13 },
    { "mes": "2026-10", "cantidad": 186, "montoTotal": 412580.00 }
  ]
}
```

**Significado de cada bloque:**

| Campo | CU | Cálculo |
|---|---|---|
| `clientes.total` | CU12 | Clientes registrados **hasta el fin del periodo** (`fecha_registro` < `hasta + 1 día`) |
| `clientes.nuevosEnPeriodo` | CU12 | Clientes registrados **dentro** del periodo |
| `clientes.porTipo` | CU12 | Mismo universo que `total` (la suma de las 3 cantidades = `total`). Siempre trae los 3 tipos en este orden, con `0` si no hay |
| `ventas.cantidad` | CU13 | `COUNT` de ventas con `fecha` entre `desde` y `hasta` |
| `ventas.montoTotal` | CU13 | `SUM(total)` de esas ventas; `0.00` si no hay ninguna |
| `ventas.anterior` | CU13 | Lo mismo, para el periodo anterior (sección 1) |
| `ventasPorMes` | CU13 | 6 meses que **terminan en el mes de `hasta`**, de más antiguo a más reciente; `mes` en formato `AAAA-MM`; los meses sin ventas salen con `cantidad: 0` y `montoTotal: 0.00` |
| `desde`, `hasta` | CU14 | Periodo aplicado (útil cuando no se enviaron parámetros) |

- El gráfico «Monto vendido por mes (S/)» usa `ventasPorMes`; el nombre corto del mes (May, Jun…) lo pone el frontend.
- Si no hay datos en el periodo, la respuesta es igual con ceros (no es un error).

**Reglas de validación (400 `VALIDACION`):**

| Caso | Campo | Mensaje |
|---|---|---|
| Fecha con formato inválido (`2026-13-01`, `abc`) | `desde` / `hasta` | "El valor no tiene un formato válido." |
| Solo llega una de las dos fechas | la que falta | "Indica la fecha de inicio del periodo." / "Indica la fecha de fin del periodo." |
| `desde` > `hasta` | `hasta` | "La fecha final no puede ser anterior a la inicial." |
| Periodo de más de 366 días | `hasta` | "El periodo admite hasta 366 días." |

**Errores:** 400 `VALIDACION`, 401. No hay 403: los tres roles pueden ver el dashboard.

## 3. Casos para las pruebas (M4-2)

| # | Petición | Resultado esperado |
|---|---|---|
| 1 | Sin token | 401 `NO_AUTENTICADO` |
| 2 | Sin parámetros (cualquier rol) | 200 con `desde`/`hasta` = mes actual |
| 3 | Periodo con ventas de prueba conocidas | `ventas.cantidad` y `ventas.montoTotal` cuadran con lo insertado |
| 4 | Periodo sin ventas | `cantidad: 0`, `montoTotal: 0.00` |
| 5 | Cliente nuevo registrado en el periodo | `nuevosEnPeriodo` y `total` aumentan en 1; `porTipo` suma `total` |
| 6 | `ventasPorMes` | 6 elementos, ordenados, el último es el mes de `hasta`, meses vacíos en 0 |
| 7 | `ventas.anterior` | Fechas calculadas según la sección 1 (Hoy → ayer; octubre → 31/08–30/09) |
| 8 | `desde` > `hasta` | 400 en `hasta` |
| 9 | Solo `desde` | 400 en `hasta` |
| 10 | Más de 366 días | 400 en `hasta` |
| 11 | Fecha mal escrita | 400 "El valor no tiene un formato válido." |

## 4. Fuera del alcance de M4

- Indicadores por vendedor, por producto o por cliente (más allá del tipo).
- Exportar el dashboard (PDF, Excel) y actualización en tiempo real.
- Comparar con el mes calendario anterior: se compara siempre con un periodo de la misma cantidad de días.
