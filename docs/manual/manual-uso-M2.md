# Manual de uso — Módulo 2: Consulta y Edición de Clientes

**Sistema:** CRM Amazonas (MVP) · **Empresa:** Textil El Amazonas S.A. BIC

**Versión:** M2 · **Fecha:** octubre de 2026

**Casos de uso cubiertos:** CU05 Buscar cliente · CU06 Ver detalle del cliente · CU07 Editar cliente

> Para iniciar sesión, poner en marcha el sistema y registrar clientes, consulta el **Manual de uso del Módulo 1** (`docs/manual/manual-uso-M1.md`).

---

## 1. Qué permite hacer este módulo

- Buscar clientes por razón social, nombre, RUC o DNI, y filtrarlos por tipo (CU05).
- Ver todos los datos de un cliente, quién lo registró y quién lo editó por última vez (CU06).
- Corregir o actualizar los datos de un cliente (CU07).

Las ventas de cada cliente se mostrarán en su detalle con el **módulo M3**.

---

## 2. Roles y permisos

| Acción | Comercial | Gerencia | Administrador |
|---|---|---|---|
| Buscar y ver clientes | ✅ | ✅ | ✅ |
| Registrar cliente | ✅ | ❌ | ✅ |
| Editar cliente | ✅ | ❌ | ✅ |

Gerencia no ve los botones de editar. Si escribe la dirección de edición a mano, el sistema la devuelve a **Clientes** con el aviso *"Tu rol no tiene permiso para editar clientes."* El servidor también rechaza la operación (código 403).

---

## 3. CU05 — Buscar cliente

1. En el menú, entra a **Clientes**.
2. Escribe en el buscador parte de la **razón social, el nombre, el RUC o el DNI**. La búsqueda no distingue mayúsculas y se actualiza sola un instante después de dejar de escribir.
3. Si quieres, elige un **tipo de cliente** en el filtro (*Tipo: Todos* muestra todos).
4. La tabla muestra 8 clientes por página, ordenados por razón social. Usa los botones de abajo para cambiar de página.

| Columna | Qué muestra |
|---|---|
| Documento | Tipo y número, por ejemplo *RUC 20601234571* |
| Razón social / Nombre | Nombre de la empresa o de la persona |
| Tipo | Etiqueta de color: Confeccionista, Distribuidor o Institucional |
| Teléfono | Con espacios para leerlo mejor, por ejemplo *987 654 321* |
| Correo | O *—* si no tiene |
| Acciones | 👁 Ver detalle · ✏ Editar (solo Comercial y Administrador) |

| Mensaje | Qué significa |
|---|---|
| *Mostrando 1–8 de N clientes* | Cuántos clientes hay en total con los filtros actuales |
| *No se encontraron clientes con esos filtros.* | Ningún cliente coincide con la búsqueda o el tipo elegido |
| *Aún no hay clientes registrados.* | La base de clientes está vacía |

---

## 4. CU06 — Ver detalle del cliente

1. En la lista, pulsa el ícono **👁 Ver detalle** del cliente.
2. Verás su nombre con la etiqueta de tipo y la tarjeta **Datos del cliente**: documento, razón social, tipo, contacto, teléfono, correo, dirección, **Registrado por** (usuario y fecha) y **Última edición** (usuario y fecha, o *Sin ediciones*).
3. Para regresar, pulsa **Volver a clientes**.

Si la dirección corresponde a un cliente que no existe, aparece *"No existe un cliente con ese identificador."*

---

## 5. CU07 — Editar cliente

Disponible para **Comercial** y **Administrador**.

1. Entra a la edición desde el botón **Editar cliente** del detalle o desde el ícono **✏** de la lista.
2. El formulario aparece con los datos actuales y el aviso *"Editando: … · Se aplican las mismas validaciones del registro (CU04)."*
3. El **tipo y el número de documento no se pueden modificar** (aparecen en gris). Si un documento se registró mal, el cliente debe registrarse de nuevo.
4. Cambia los datos necesarios y pulsa **Guardar cambios**.
5. El sistema vuelve al detalle con el aviso *"Cambios guardados en "…"."* y actualiza **Última edición** con tu nombre y la fecha.

Para salir sin guardar, pulsa **Cancelar** o **Volver al detalle**.

### Validaciones al editar

Son las mismas del registro (CU04):

| Regla | Mensaje |
|---|---|
| Razón social obligatoria | *Este campo es obligatorio.* |
| Razón social muy corta o larga | *La razón social debe tener entre 3 y 150 caracteres.* |
| Tipo de cliente obligatorio | *Selecciona el tipo de cliente.* |
| Teléfono obligatorio | *Ingresa el teléfono.* |
| Teléfono con formato inválido | *El teléfono debe tener entre 7 y 9 dígitos.* |
| Correo con formato inválido | *Ingresa un correo válido, por ejemplo nombre@empresa.com.* |

---

## 6. Pruebas rápidas por caso de uso (para QA)

Sobre `main` actualizado, con el backend y el frontend en marcha. Usuarios y contraseña en el manual de M1.

| CU | Prueba | Resultado esperado |
|---|---|---|
| CU05 | Como María, entrar a Clientes | Tabla con los clientes y "Mostrando 1–N de N clientes" |
| CU05 | Buscar "gam" | Solo los clientes cuya razón social o documento contiene "gam" |
| CU05 | Buscar por parte de un RUC | Aparece el cliente con ese documento |
| CU05 | Filtrar por Distribuidor | Solo distribuidores |
| CU05 | Buscar "zzz" | *No se encontraron clientes con esos filtros.* |
| CU05 | Con más de 8 clientes, ir a la página 2 | Muestra los siguientes clientes |
| CU06 | Pulsar 👁 en un cliente | Detalle con sus datos y "Registrado por" |
| CU06 | Abrir `/clientes/999999` | *No existe un cliente con ese identificador.* |
| CU07 | Como María, editar la persona de contacto y guardar | Vuelve al detalle con el aviso verde y "Última edición: María Quispe" |
| CU07 | Editar y borrar el teléfono | *Ingresa el teléfono.* bajo el campo |
| CU07 | Verificar el documento en la edición | Tipo y número en gris, no editables |
| CU07 | Como Jorge, entrar a Clientes | No aparecen los íconos ✏ ni el botón Editar cliente |
| CU07 | Como Jorge, abrir `/clientes/1/editar` | Vuelve a Clientes con el aviso de permiso |

---

## 7. Limitaciones conocidas de esta versión

- Las ventas del cliente aparecen en el detalle recién con el módulo M3 (CU09).
- El tipo y el número de documento no se pueden corregir desde la edición.
- Si dos usuarios editan el mismo cliente al mismo tiempo, se guarda el último cambio.
- En celulares, la tabla de clientes se desplaza hacia los lados en lugar de mostrarse en tarjetas.