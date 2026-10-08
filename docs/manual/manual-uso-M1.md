# Manual de uso — Módulo 1: Autenticación y Registro de Clientes

**Sistema:** CRM Amazonas (MVP) · **Empresa:** Textil El Amazonas S.A. BIC
**Versión:** M1 · **Fecha:** octubre de 2026
**Casos de uso cubiertos:** CU01 Iniciar sesión · CU02 Cerrar sesión · CU03 Registrar cliente · CU04 Validar datos del cliente

---

## 1. Qué permite hacer este módulo

- Entrar al sistema con un correo corporativo y una contraseña (CU01).
- Salir del sistema de forma segura (CU02).
- Registrar nuevos clientes: confeccionistas, distribuidores y cuentas institucionales (CU03).
- Validar los datos del cliente antes de guardarlos: RUC/DNI, campos obligatorios, teléfono, correo y documentos duplicados (CU04).

La consulta, búsqueda y edición de clientes llegan en el **módulo M2**. Las ventas, en el M3, y el dashboard, en el M4.

---

## 2. Roles y permisos

| Rol | Quién lo usa | Iniciar y cerrar sesión | Registrar clientes |
|---|---|---|---|
| **Comercial** | Ejecutivos del área comercial | ✅ | ✅ |
| **Gerencia** | Gerencia comercial (consulta indicadores) | ✅ | ❌ |
| **Administrador** | Administrador del sistema | ✅ | ✅ |

Si un usuario de Gerencia intenta entrar a "Registrar cliente" escribiendo la dirección en el navegador, el sistema lo devuelve a **Clientes** con el aviso *"Tu rol no tiene permiso para registrar clientes."* El servidor también rechaza la operación (código 403).

### Usuarios de demostración

Contraseña de los tres usuarios: **`Clave2026!`**

| Nombre | Correo | Rol |
|---|---|---|
| María Quispe | `mquispe@amazonas.com.pe` | Comercial |
| Jorge Salas | `jsalas@amazonas.com.pe` | Gerencia |
| Administrador CRM | `admin@amazonas.com.pe` | Administrador |

> Son usuarios de prueba creados por la migración `V11`. En un entorno real cada persona tendría su propia contraseña.

---

## 3. Cómo poner en marcha el sistema (equipo y evaluadores)

### 3.1 Requisitos

- Java 21
- Node.js 20 o superior
- PostgreSQL 16, con una base de datos `crm_db` y un usuario `crm` dueño de esa base
- Git

Si la base de datos no existe, créala una sola vez desde `psql` con el usuario `postgres`:

```sql
CREATE USER crm WITH PASSWORD 'tu-clave';
CREATE DATABASE crm_db OWNER crm;
```

No hace falta crear tablas: **Flyway** las crea solas al arrancar el backend (migraciones `V10`, `V11` y `V12`).

### 3.2 Configurar el backend

1. En la carpeta `backend`, copia `.env.example` como `.env`.
2. Completa `DB_PASSWORD` con la clave del usuario `crm`.
3. Genera tu propia clave para `JWT_SECRET` (en PowerShell):

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

> El archivo `.env` contiene secretos: **nunca** se sube al repositorio (ya está en `.gitignore`).

### 3.3 Arrancar

Abre dos terminales:

```powershell
# Terminal 1: backend (http://localhost:8080)
cd backend
.\mvnw.cmd spring-boot:run
```

```powershell
# Terminal 2: frontend (http://localhost:5173)
cd frontend
npm install      # solo la primera vez
npm run dev
```

Abre **http://localhost:5173** en el navegador.

---

## 4. CU01 — Iniciar sesión

1. Abre el sistema. Si no has iniciado sesión, aparece la pantalla **Iniciar sesión**.
2. Escribe tu **correo** corporativo y tu **contraseña**.
3. Pulsa **Ingresar**.
4. El sistema te lleva al **Dashboard**. Arriba a la derecha verás tus iniciales, tu nombre y tu rol.

**Bueno saber:**

- El correo no distingue mayúsculas ni espacios al inicio o al final.
- La sesión dura **8 horas**. Al vencer, el sistema te lleva de nuevo al inicio de sesión.
- Si intentaste abrir una página interna sin sesión, después de ingresar el sistema te lleva a esa página.
- ¿Olvidaste tu contraseña? Comunícate con el administrador del sistema.

| Mensaje | Qué significa |
|---|---|
| *Ingresa tu correo.* / *Ingresa tu contraseña.* | Dejaste un campo vacío |
| *Ingresa un correo válido, por ejemplo nombre@empresa.com.* | El correo no tiene el formato correcto |
| *Correo o contraseña incorrectos.* | Los datos no coinciden con ningún usuario activo. Por seguridad no se indica cuál de los dos falló |
| *No se pudo conectar con el servidor. Inténtalo de nuevo.* | El backend está apagado o no hay conexión |

---

## 5. CU02 — Cerrar sesión

1. En el menú lateral, pulsa **Cerrar sesión** (abajo). En el celular, abre primero el menú con el botón ☰.
2. El sistema borra tu sesión de este navegador y vuelve a la pantalla **Iniciar sesión**.

Después de cerrar sesión, ninguna página interna se puede abrir sin volver a ingresar.

---

## 6. CU03 — Registrar cliente

Disponible para **Comercial** y **Administrador**.

1. En el menú, entra a **Clientes**.
2. Pulsa **Registrar cliente**.
3. Completa el formulario. Los campos con **\*** son obligatorios.

| Sección | Campo | Obligatorio | Indicaciones |
|---|---|---|---|
| Identificación | Tipo de documento | Sí | RUC o DNI |
| | N.° de documento | Sí | RUC: 11 dígitos, empieza en 10 o 20. DNI: 8 dígitos |
| | Razón social o nombre completo | Sí | De 3 a 150 caracteres |
| | Tipo de cliente | Sí | Confeccionista, Distribuidor o Institucional |
| Contacto | Persona de contacto | No | Hasta 100 caracteres |
| | Teléfono | Sí | De 7 a 9 dígitos. Puedes escribirlo con espacios (`987 654 321`); el sistema los quita |
| | Correo electrónico | No | Formato `nombre@empresa.com` |
| | Dirección | No | Hasta 200 caracteres |

4. Pulsa **Guardar cliente**.
5. Si todo está correcto, el sistema vuelve a **Clientes** con el mensaje verde *Cliente "…" registrado correctamente.*

El sistema guarda automáticamente **quién registró** al cliente y **la fecha y hora** del registro.

Para salir sin guardar, pulsa **Cancelar** o **Volver a clientes**.

---

## 7. CU04 — Validación de los datos del cliente

Los datos se revisan **dos veces**:

1. **En el navegador**, al pulsar *Guardar cliente*, para avisarte al instante.
2. **En el servidor**, que vuelve a revisar todo y además comprueba que el documento no exista ya.

Si algo falla, aparece arriba el aviso *"No se pudo guardar el cliente. Corrige los N campos marcados en rojo."*, y cada campo con error se marca en rojo con su mensaje debajo. Al corregir un campo, su mensaje desaparece.

| Regla | Mensaje |
|---|---|
| Tipo de documento obligatorio | *Selecciona el tipo de documento.* |
| N.° de documento obligatorio | *Ingresa el número de documento.* |
| RUC con formato inválido | *El RUC debe tener 11 dígitos y empezar en 10 o 20.* |
| DNI con formato inválido | *El DNI debe tener 8 dígitos.* |
| Documento ya registrado | *Ya existe un cliente registrado con este documento.* |
| Razón social obligatoria | *Este campo es obligatorio.* |
| Razón social muy corta o larga | *La razón social debe tener entre 3 y 150 caracteres.* |
| Tipo de cliente obligatorio | *Selecciona el tipo de cliente.* |
| Teléfono obligatorio | *Ingresa el teléfono.* |
| Teléfono con formato inválido | *El teléfono debe tener entre 7 y 9 dígitos.* |
| Correo con formato inválido | *Ingresa un correo válido, por ejemplo nombre@empresa.com.* |

---

## 8. Pruebas rápidas por caso de uso (para QA)

Sobre `main` actualizado, con el backend y el frontend en marcha.

| CU | Prueba | Resultado esperado |
|---|---|---|
| CU01 | Ingresar como María con `Clave2026!` | Entra al Dashboard; arriba muestra "María Quispe · Comercial" |
| CU01 | Ingresar con una contraseña incorrecta | *Correo o contraseña incorrectos.* |
| CU01 | Abrir `http://localhost:5173/clientes` sin sesión | Lleva al inicio de sesión; tras ingresar, vuelve a Clientes |
| CU02 | Pulsar **Cerrar sesión** | Vuelve al inicio de sesión |
| CU02 | Tras cerrar sesión, abrir `/dashboard` | Lleva al inicio de sesión |
| CU03 | Como María, registrar RUC `20512345678`, razón social, tipo y teléfono válidos | Vuelve a Clientes con el mensaje verde |
| CU03 | Como Administrador, registrar un cliente válido | Igual que el anterior |
| CU03 | Como Jorge (Gerencia), entrar a Clientes | No aparece el botón **Registrar cliente** |
| CU03 | Como Jorge, abrir `/clientes/nuevo` | Vuelve a Clientes con el aviso amarillo de permiso |
| CU04 | Pulsar **Guardar cliente** con el formulario vacío | 4 campos en rojo y el aviso "Corrige los 4 campos…" |
| CU04 | RUC `2051234567` (10 dígitos) | *El RUC debe tener 11 dígitos y empezar en 10 o 20.* |
| CU04 | DNI `1234567` (7 dígitos) | *El DNI debe tener 8 dígitos.* |
| CU04 | Teléfono `12345` | *El teléfono debe tener entre 7 y 9 dígitos.* |
| CU04 | Correo `ventas@empresa` | *Ingresa un correo válido…* |
| CU04 | Repetir el RUC de un cliente ya registrado | *Ya existe un cliente registrado con este documento.* |

---

## 9. Limitaciones conocidas de esta versión

- La pantalla **Clientes** todavía no muestra la lista: la consulta y la búsqueda llegan en M2 (CU05).
- No hay recuperación de contraseña desde el sistema: la gestiona el administrador.
- Cerrar sesión borra la sesión del navegador, pero el token emitido sigue siendo técnicamente válido hasta que vence (8 horas). Es una mejora prevista para versiones futuras.