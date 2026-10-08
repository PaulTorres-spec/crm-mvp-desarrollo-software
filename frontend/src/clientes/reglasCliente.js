// Reglas del CU04 en el navegador: las mismas del backend (docs/api/contrato-M1.md, sección 6).
// Avisan ANTES de enviar; el backend vuelve a validar porque es la única validación confiable.

export const TIPOS_DOCUMENTO = [
  { valor: 'RUC', texto: 'RUC' },
  { valor: 'DNI', texto: 'DNI' },
]

export const TIPOS_CLIENTE = [
  { valor: 'CONFECCIONISTA', texto: 'Confeccionista' },
  { valor: 'DISTRIBUIDOR', texto: 'Distribuidor' },
  { valor: 'INSTITUCIONAL', texto: 'Institucional' },
]

/** Valores iniciales del formulario: todo es texto, igual que en los inputs. */
export const CLIENTE_VACIO = {
  tipoDocumento: 'RUC',
  numeroDocumento: '',
  razonSocial: '',
  tipoCliente: '',
  personaContacto: '',
  telefono: '',
  correo: '',
  direccion: '',
}

// "987 654 321" → "987654321"
const sinEspacios = (texto) => texto.replace(/\s/g, '')
// Texto vacío o solo espacios → null (el backend guarda null en los campos opcionales)
const opcional = (texto) => texto.trim() || null

/** Arma el JSON para POST /api/clientes con los datos ya limpios. */
export function prepararCliente(datos) {
  return {
    tipoDocumento: datos.tipoDocumento,
    numeroDocumento: sinEspacios(datos.numeroDocumento),
    razonSocial: datos.razonSocial.trim(),
    tipoCliente: datos.tipoCliente,
    personaContacto: opcional(datos.personaContacto),
    telefono: sinEspacios(datos.telefono),
    correo: opcional(datos.correo),
    direccion: opcional(datos.direccion),
  }
}

/** Devuelve { campo: mensaje } con los errores. Un objeto vacío significa que todo está bien. */
export function validarCliente(datos) {
  const cliente = prepararCliente(datos)
  const errores = {}

  if (!cliente.tipoDocumento) errores.tipoDocumento = 'Selecciona el tipo de documento.'

  if (!cliente.numeroDocumento) {
    errores.numeroDocumento = 'Ingresa el número de documento.'
  } else if (cliente.tipoDocumento === 'RUC' && !/^(10|20)\d{9}$/.test(cliente.numeroDocumento)) {
    errores.numeroDocumento = 'El RUC debe tener 11 dígitos y empezar en 10 o 20.'
  } else if (cliente.tipoDocumento === 'DNI' && !/^\d{8}$/.test(cliente.numeroDocumento)) {
    errores.numeroDocumento = 'El DNI debe tener 8 dígitos.'
  }

  if (!cliente.razonSocial) {
    errores.razonSocial = 'Este campo es obligatorio.'
  } else if (cliente.razonSocial.length < 3 || cliente.razonSocial.length > 150) {
    errores.razonSocial = 'La razón social debe tener entre 3 y 150 caracteres.'
  }

  if (!cliente.tipoCliente) errores.tipoCliente = 'Selecciona el tipo de cliente.'

  if (cliente.personaContacto?.length > 100) {
    errores.personaContacto = 'La persona de contacto puede tener como máximo 100 caracteres.'
  }

  if (!cliente.telefono) {
    errores.telefono = 'Ingresa el teléfono.'
  } else if (!/^\d{7,9}$/.test(cliente.telefono)) {
    errores.telefono = 'El teléfono debe tener entre 7 y 9 dígitos.'
  }

  if (cliente.correo && !/^\S+@\S+\.\S+$/.test(cliente.correo)) {
    errores.correo = 'Ingresa un correo válido, por ejemplo nombre@empresa.com.'
  } else if (cliente.correo?.length > 120) {
    errores.correo = 'El correo puede tener como máximo 120 caracteres.'
  }

  if (cliente.direccion?.length > 200) {
    errores.direccion = 'La dirección puede tener como máximo 200 caracteres.'
  }

  return errores
}