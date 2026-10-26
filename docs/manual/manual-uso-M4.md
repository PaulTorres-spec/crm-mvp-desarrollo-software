# Manual de uso — Módulo 4: Dashboard Básico

**Sistema:** CRM Amazonas (MVP) · **Empresa:** Textil El Amazonas S.A. BIC

**Versión:** M4 · **Fecha:** octubre de 2026

**Casos de uso cubiertos:** CU12 Ver N° de clientes · CU13 Ver N° de ventas y monto total vendido · CU14 Filtrar indicadores por periodo

> Para iniciar sesión y poner en marcha el sistema, consulta el **Manual de uso del Módulo 1** (`docs/manual/manual-uso-M1.md`). Los clientes se registran con el Módulo 1 y las ventas con el **Módulo 3** (`docs/manual/manual-uso-M3.md`): el dashboard solo muestra esa información resumida.

---

## 1. Qué permite hacer este módulo

- Ver cuántos clientes tiene la empresa, cuántos se registraron en el periodo y cómo se reparten por tipo (CU12).
- Ver cuántas ventas se hicieron en el periodo, cuánto suman y cómo cambian frente al periodo anterior, más el monto vendido de los últimos 6 meses (CU13).
- Elegir el periodo de los indicadores: hoy, este mes, el trimestre, el año o un rango de fechas propio (CU14).

---

## 2. Roles y permisos

| Acción | Comercial | Gerencia | Administrador |
|---|---|---|---|
| Ver el dashboard y cambiar el periodo | ✅ | ✅ | ✅ |

El dashboard es de **solo lectura**: no registra ni modifica datos. Es la primera pantalla después de iniciar sesión y también se abre desde **Dashboard** en el menú.

---

## 3. CU14 — Elegir el periodo

Arriba de la pantalla, junto a **Periodo**, hay cuatro botones. El elegido se ve en color vino y la caja con el calendario muestra las fechas que se están usando.

| Botón | Fechas que usa | Ejemplo (hoy = 26/10/2026) |
|---|---|---|
| **Hoy** | Solo el día de hoy | 26/10/2026 – 26/10/2026 |
| **Este mes** (por defecto) | Del primer al último día del mes actual | 01/10/2026 – 31/10/2026 |
| **Trimestre** | El trimestre calendario actual (ene–mar, abr–jun, jul–sep u oct–dic) | 01/10/2026 – 31/12/2026 |
| **Año** | Del 1 de enero al 31 de diciembre del año actual | 01/01/2026 – 31/12/2026 |

### Rango de fechas propio

1. Pulsa la caja del **calendario** (la que muestra las fechas).
2. Elige **Desde** y **Hasta** y pulsa **Aplicar**. **Cancelar** cierra el formulario sin cambiar nada.
3. Al aplicar, ningún botón queda marcado y la caja del calendario se ve en color vino.

| Regla | Mensaje |
|---|---|
| Falta la fecha inicial | *Indica la fecha de inicio del periodo.* |
| Falta la fecha final | *Indica la fecha de fin del periodo.* |
| La fecha final es anterior a la inicial | *La fecha final no puede ser anterior a la inicial.* |
| El rango tiene más de 366 días | *El periodo admite hasta 366 días.* |

Mientras se cargan los indicadores del nuevo periodo, los anteriores se ven un poco más claros.

---

## 4. CU12 — Número de clientes

**Tarjeta «N.° de clientes»**

- El número grande es el **total de clientes registrados hasta el último día del periodo**. Por ejemplo, con un periodo de 2025 no se cuentan los clientes registrados en 2026.
- Debajo: *"+N nuevos en el periodo"* (clientes registrados entre la fecha inicial y la final) o *"Sin clientes nuevos en el periodo"*.

**Tarjeta «Clientes por tipo»**

- Muestra **Confeccionistas**, **Distribuidores** e **Institucionales** con su cantidad y una barra proporcional al total.
- Las tres cantidades suman lo mismo que la tarjeta «N.° de clientes».
- Al pie: *"Clientes registrados hasta el DD/MM/AAAA."*

---

## 5. CU13 — Número de ventas y monto total vendido

**Tarjetas «N.° de ventas» y «Monto total vendido»**

- Cuentan y suman las ventas cuya **fecha de venta** está dentro del periodo (no la fecha en que se registraron en el sistema). El monto incluye IGV.
- Debajo de cada número aparece la comparación con el **periodo anterior**, que tiene **la misma cantidad de días** y termina el día antes:

| Periodo elegido | Periodo anterior que se compara |
|---|---|
| Hoy (26/10/2026) | Ayer (25/10/2026) |
| Este mes (01/10 – 31/10, 31 días) | 31/08 – 30/09 |
| Rango 01/10 – 10/10 (10 días) | 21/09 – 30/09 |

- La nota se ve en **verde** si subió (*"+8.1 % frente al periodo anterior"*) y en **rojo** si bajó (*"-5.4 % …"*).
- Si en el periodo anterior no hubo ventas, dice *"Sin ventas en el periodo anterior"* (no se puede calcular un porcentaje).

**Gráfico «Monto vendido por mes (S/)»**

- Muestra **6 meses**: los que terminan en el mes de la fecha final del periodo. Con «Este mes» en octubre, de mayo a octubre; con «Año», de julio a diciembre.
- Encima de cada barra está el monto abreviado (*118*, *12 mil*, *1.5 M*). Al pasar el mouse sobre una barra se ve el monto exacto y la cantidad de ventas.
- La barra del **mes en curso** se ve en **rojo**. Los meses sin ventas aparecen como una línea en la base.

---

## 6. Pruebas rápidas por caso de uso (para QA)

Sobre `main` actualizado, con el backend y el frontend en marcha. Usuarios y contraseña en el manual de M1. Como las cifras dependen de los datos de cada base, varias pruebas comparan **antes y después** de registrar algo.

| CU | Prueba | Resultado esperado |
|---|---|---|
| CU12 | Como Jorge (Gerencia), iniciar sesión | Se abre el Dashboard con «Este mes» marcado y las fechas del mes actual |
| CU12 | Comparar «Clientes por tipo» con «N.° de clientes» | Las 3 cantidades suman el total |
| CU12 | Como María, registrar un cliente Institucional y volver al Dashboard | N.° de clientes +1, nuevos +1 e Institucionales +1 |
| CU12 | Rango 01/01/2025 – 31/12/2025 | Clientes 0 (todos se registraron en 2026) |
| CU13 | Comparar «Este mes» con Ventas → Filtrar el mismo rango | Igual cantidad de ventas e igual total que los indicadores de Ventas |
| CU13 | Como María, registrar una venta con fecha de hoy y volver al Dashboard → Hoy | N.° de ventas +1 y el monto sube en el total de esa venta |
| CU13 | Rango sin ventas (por ejemplo 01/01/2025 – 31/01/2025) | Ventas 0, S/ 0.00 y *"Sin ventas en el periodo anterior"* |
| CU13 | Gráfico con «Este mes» | 6 meses que terminan en el mes actual; el mes actual en rojo |
| CU13 | Gráfico con «Año» | Julio a diciembre; la barra roja sigue siendo la del mes actual |
| CU14 | Pulsar Hoy, Trimestre y Año | Cambian el botón marcado, las fechas de la caja y los indicadores |
| CU14 | Calendario → 31/10/2026 a 01/10/2026 → Aplicar | *La fecha final no puede ser anterior a la inicial.* |
| CU14 | Calendario → 01/01/2025 a 02/01/2026 → Aplicar | *El periodo admite hasta 366 días.* |
| CU14 | Calendario → rango válido → Aplicar | Ningún botón marcado, caja en vino, indicadores del rango |
| CU14 | Vista móvil (390 px) | Tarjetas una debajo de otra y gráfico legible |

---

## 7. Limitaciones conocidas de esta versión

- No hay indicadores por **vendedor**, por **producto** ni por **cliente** (solo por tipo de cliente).
- El dashboard **no se exporta** (PDF o Excel) ni se actualiza solo: hay que cambiar de periodo o recargar para ver datos nuevos.
- La comparación es siempre con un periodo de **la misma cantidad de días**, no con el mes calendario anterior (octubre se compara con 31/08–30/09).
- El periodo máximo es de **366 días**.
- El periodo elegido **no se conserva** al recargar la página: vuelve a «Este mes».
- Los montos se muestran en formato peruano estándar (*S/ 11,639.52*); el prototipo usaba *S/ 412 580,00*.
