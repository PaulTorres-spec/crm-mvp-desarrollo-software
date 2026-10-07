// Módulo único para hablar con la API del backend (contrato en docs/api/contrato-M1.md).

const CLAVE_TOKEN = 'crm.token'

export function obtenerToken() {
  return localStorage.getItem(CLAVE_TOKEN)
}

export function guardarToken(token) {
  localStorage.setItem(CLAVE_TOKEN, token)
}

export function borrarToken() {
  localStorage.removeItem(CLAVE_TOKEN)
}

/** Error con el formato estándar del contrato: { estado, codigo, mensaje, errores }. */
export class ErrorApi extends Error {
  constructor(estado, cuerpo) {
    super(cuerpo?.mensaje ?? 'No se pudo conectar con el servidor. Inténtalo de nuevo.')
    this.estado = estado
    this.codigo = cuerpo?.codigo ?? null
    this.errores = cuerpo?.errores ?? []
  }
}

// Función que se ejecuta cuando un token deja de ser válido (la registra el contexto de sesión).
let alExpirarSesion = null

export function cuandoExpireLaSesion(funcion) {
  alExpirarSesion = funcion
}

/**
 * Llama a /api + ruta. Agrega el token si existe, envía y recibe JSON,
 * y lanza ErrorApi si la respuesta no es 2xx.
 */
export async function pedir(ruta, { metodo = 'GET', cuerpo } = {}) {
  const headers = { Accept: 'application/json' }
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json'

  const token = obtenerToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    // El navegador ni siquiera pudo enviar la petición (backend apagado, sin red)
    throw new ErrorApi(0, null)
  }

  const texto = await respuesta.text()
  let datos = null
  try {
    datos = texto ? JSON.parse(texto) : null
  } catch {
    // La respuesta no era JSON (por ejemplo, un error del proxy): datos se queda en null
  }

  if (!respuesta.ok) {
    // Teníamos token y aun así es 401: venció o es inválido. Cerramos la sesión.
    if (respuesta.status === 401 && token && alExpirarSesion) alExpirarSesion()
    throw new ErrorApi(respuesta.status, datos)
  }
  return datos
}