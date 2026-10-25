# Manual de uso — Módulo 3: Registro y Consulta de Ventas

**Sistema:** CRM Amazonas (MVP) · **Empresa:** Textil El Amazonas S.A. BIC

**Versión:** M3 · **Fecha:** octubre de 2026

**Casos de uso cubiertos:** CU08 Registrar venta · CU09 Asociar venta a cliente · CU10 Consultar ventas · CU11 Filtrar ventas por fecha o cliente

> Para iniciar sesión y poner en marcha el sistema, consulta el **Manual de uso del Módulo 1** (`docs/manual/manual-uso-M1.md`). Para buscar y editar clientes, el **Manual del Módulo 2** (`docs/manual/manual-uso-M2.md`).

---

## 1. Qué permite hacer este módulo

- Registrar una venta con uno o varios productos del catálogo; el sistema calcula subtotal, IGV (18 %) y total (CU08).
- Asociar cada venta a un cliente ya registrado: no se puede vender a un cliente que no exista en el CRM (CU09).
- Consultar las ventas con su número, fecha, cliente, quién la registró y total (CU10).
- Filtrar las ventas por rango de fechas y por cliente, y ver cuántas son y cuánto suman (CU11).
- Ver el detalle de cada venta y, en el detalle de un cliente, sus indicadores y últimas ventas.

---

## 2. Roles y permisos

| Acción | Comercial | Gerencia | Administrador |
|---|---|---|---|
| Consultar y filtrar ventas | ✅ | ✅ | ✅ |
| Ver el detalle de una venta | ✅ | ✅ | ✅ |
| Registrar venta | ✅ | ❌ | ✅ |

Gerencia no ve los botones **Registrar venta**. Si escribe la dirección `/ventas/nueva` a mano, el sistema la devuelve a **Ventas** con el aviso *"Tu rol no tiene permiso para registrar ventas."* El servidor también rechaza la operación (código 403).

---

## 3. Catálogo de productos

El catálogo viene cargado con el sistema. Cada producto tiene un **precio referencial** que se propone al elegirlo; el usuario puede cambiarlo en cada venta.

| Código | Producto | Unidad | Precio referencial |
|---|---|---|---|
| HIL-PIMA-301 | Hilo de algodón Pima 30/1 | kg | S/ 28.50 |
| HIL-PIMA-401 | Hilo de algodón Pima 40/1 | kg | S/ 32.00 |
| HIL-POL-402 | Hilo poliéster 40/2 | kg | S/ 18.90 |
| HIL-TANG-301 | Hilo de algodón Tangüis 30/1 | kg | S/ 22.40 |
| HIL-MEZ-301 | Hilo mezcla algodón/poliéster 30/1 | kg | S/ 20.80 |
| HIL-ALP-228 | Hilo de alpaca 2/28 | kg | S/ 96.00 |

---

## 4. CU08 y CU09 — Registrar venta

Disponible para **Comercial** y **Administrador**.

1. Entra a **Ventas** y pulsa **Registrar venta**. También puedes hacerlo desde el detalle de un cliente: así el formulario se abre con ese cliente ya elegido.
2. En **Cliente**, escribe al menos 2 letras del nombre, RUC o DNI y elige el cliente de la lista. Solo aparecen clientes registrados (CU09). Para elegir otro, pulsa **Cambiar**.
3. Revisa la **Fecha** (por defecto, hoy). No se aceptan fechas futuras.
4. En **Detalle de productos**, para cada fila:
   - elige el **Producto** (el precio referencial se completa solo),
   - escribe la **Cantidad** en kg (acepta coma o punto, hasta 2 decimales),
   - ajusta el **Precio unitario** si corresponde.
   El **Subtotal** de la fila se calcula al instante.
5. Usa **+ Agregar producto** para más filas (hasta 20) y el ícono de papelera para quitar una.
6. Si quieres, escribe **Observaciones** (hasta 300 caracteres).
7. Revisa la tarjeta **Resumen**: cliente, número de ítems y kilos, subtotal, IGV (18 %) y total.
8. Pulsa **Registrar venta**. El sistema vuelve a **Ventas** con el aviso *"Venta V-2026-NNNN registrada a … por S/ …"*.

**Sobre los montos:** el resumen es una vista previa. Al registrar, el **servidor vuelve a calcular** subtotal, IGV y total y genera el número de venta (`V-AAAA-NNNN`); esos son los valores que se guardan.

### Validaciones al registrar

| Regla | Mensaje |
|---|---|
| Cliente obligatorio | *Selecciona un cliente.* |
| Cliente inexistente | *El cliente no existe.* |
| Fecha obligatoria | *La fecha es obligatoria.* |
| Fecha futura | *La fecha no puede ser futura.* |
| Producto obligatorio en cada fila | *Selecciona un producto.* |
| Mismo producto en dos filas | *El producto está repetido.* |
| Cantidad vacía o con más de 2 decimales | *Ingresa la cantidad con hasta 2 decimales.* |
| Cantidad 0 o negativa | *La cantidad debe ser mayor que 0.* |
| Precio vacío o con más de 2 decimales | *Ingresa el precio con hasta 2 decimales.* |
| Precio 0 o negativo | *El precio debe ser mayor que 0.* |
| Cantidad o precio mayor que 99 999,99 | *… no puede superar 99 999,99.* |
| Observaciones muy largas | *Las observaciones admiten hasta 300 caracteres.* |

---

## 5. CU10 y CU11 — Consultar y filtrar ventas

1. En el menú, entra a **Ventas**. Por defecto se muestran las ventas del **mes actual**, de la más reciente a la más antigua.
2. Para filtrar (CU11), elige **Desde** y **Hasta**, y si quieres un **Cliente** (búsqueda por nombre, RUC o DNI). Luego pulsa **Filtrar**.
3. **Limpiar** vuelve al mes actual y a todos los clientes.
4. Arriba de la tabla, dos indicadores resumen **todo el rango filtrado** (no solo la página visible): *"N ventas en el rango"* y *"Total: S/ …"*.
5. La tabla muestra 8 ventas por página; usa los botones de abajo para cambiar de página.

| Columna | Qué muestra |
|---|---|
| N.° venta | Número asignado por el sistema, por ejemplo *V-2026-0004* |
| Fecha | Fecha de la venta |
| Cliente | Razón social (enlace al detalle del cliente) |
| Tipo | Etiqueta de color del tipo de cliente |
| Registrado por | Usuario que registró la venta |
| Total | Monto con IGV |
| Ver | 👁 Abre el detalle de la venta |

| Mensaje | Qué significa |
|---|---|
| *La fecha final no puede ser anterior a la inicial.* | El rango está invertido; no se aplica el filtro |
| *No hay ventas con esos filtros.* | Ninguna venta coincide con el rango o el cliente |

### Detalle de una venta

Desde el ícono 👁 se abre la venta con: cliente (con su documento y tipo), fecha, quién la registró y cuándo, observaciones, la lista de productos (cantidad, precio unitario y subtotal) y el resumen con subtotal, IGV y total guardados.

Si la dirección corresponde a una venta que no existe, aparece *"No existe una venta con ese identificador."*

### Ventas en el detalle del cliente

En **Clientes → 👁 Ver detalle**, la tarjeta **Ventas del cliente** muestra:

- **Ventas registradas**, **Monto total** y **Última compra**.
- Las **5 ventas más recientes**, con acceso a su detalle.
- Si no tiene ventas: *"Este cliente aún no tiene ventas registradas."*

---

## 6. Pruebas rápidas por caso de uso (para QA)

Sobre `main` actualizado, con el backend y el frontend en marcha. Usuarios y contraseña en el manual de M1.

| CU | Prueba | Resultado esperado |
|---|---|---|
| CU08 | Como María, Ventas → Registrar venta | Formulario con la fecha de hoy y una fila vacía |
| CU08 | Pima 30/1 × 120 y Poliéster 40/2 × 80 | Precios 28.50 y 18.90; subtotal S/ 4,932.00, IGV S/ 887.76, total S/ 5,819.76 |
| CU08 | Repetir un producto y registrar | *El producto está repetido.* y no se envía |
| CU08 | Dejar la cantidad vacía | *Ingresa la cantidad con hasta 2 decimales.* |
| CU08 | Registrar una venta válida | Vuelve a Ventas con el aviso verde y el número V-2026-NNNN |
| CU09 | Buscar un cliente escribiendo "gam" | Solo aparecen clientes registrados que coinciden |
| CU09 | Desde el detalle de un cliente → Registrar venta | El formulario abre con ese cliente elegido |
| CU09 | Como Jorge, abrir `/ventas/nueva` | Vuelve a Ventas con el aviso de permiso |
| CU10 | Como María, entrar a Ventas | Ventas del mes, la más reciente primero, con los indicadores |
| CU10 | Pulsar 👁 en una venta | Detalle con productos y montos |
| CU10 | Abrir `/ventas/999999` | *No existe una venta con ese identificador.* |
| CU10 | Detalle de un cliente con ventas | Indicadores y últimas 5 ventas |
| CU11 | Filtrar del 01/10 al 10/10 | Solo ventas de ese rango; indicadores del rango |
| CU11 | Filtrar por un cliente | Solo ventas de ese cliente |
| CU11 | Desde posterior a Hasta | *La fecha final no puede ser anterior a la inicial.* |
| CU11 | Pulsar Limpiar | Vuelve al mes actual y todos los clientes |
| CU10 | Como Jorge, entrar a Ventas | Ve la consulta, sin el botón Registrar venta |

---

## 7. Limitaciones conocidas de esta versión

- Una venta registrada **no se puede editar ni anular** desde el sistema.
- El **catálogo de productos** es fijo: se carga con el sistema y no tiene pantalla de mantenimiento.
- El IGV se calcula siempre al **18 %** y todos los montos están en **soles**.
- El número de venta es correlativo, pero **puede tener saltos** (por ejemplo, V-2026-0001 y luego V-2026-0004); no afecta a la información guardada.
- Los filtros de Ventas **no se conservan** al recargar la página: vuelven al mes actual.
- Los montos se muestran en formato peruano estándar (*S/ 6,840.00*); el prototipo usaba *S/ 6 840,00*.
- En celulares, las tablas se desplazan hacia los lados en lugar de mostrarse en tarjetas.
