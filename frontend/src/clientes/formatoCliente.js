// Cómo se muestran los datos del cliente en pantalla (no cambia lo que se guarda).
import { TIPOS_CLIENTE } from './reglasCliente.js'

/** "CONFECCIONISTA" → "Confeccionista" (usa los mismos textos del formulario). */
export function nombreTipoCliente(valor) {
  return TIPOS_CLIENTE.find((tipo) => tipo.valor === valor)?.texto ?? valor
}

/** "RUC" + "20601234571" → "RUC 20601234571" */
export function formatearDocumento(cliente) {
  return `${cliente.tipoDocumento} ${cliente.numeroDocumento}`
}

/** "987654321" → "987 654 321"; los fijos de 7 dígitos: "4251234" → "425 1234". */
export function formatearTelefono(telefono) {
  if (!telefono) return '—'
  if (telefono.length === 9) return telefono.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
  if (telefono.length === 7) return telefono.replace(/(\d{3})(\d{4})/, '$1 $2')
  return telefono
}

/** "2026-10-07T19:42:01" → "07/10/2026" (se corta el texto: así no influye la zona horaria). */
export function formatearFecha(fechaIso) {
  if (!fechaIso) return ''
  const [anio, mes, dia] = fechaIso.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}