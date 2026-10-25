// Cómo se muestran montos y cantidades (no cambia lo que se guarda).

const SOLES = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })
const CANTIDAD = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 })

/** 6840 → "S/ 6,840.00" (formato peruano). */
export function formatearSoles(monto) {
  return SOLES.format(monto)
}

/** 240 → "240 kg" */
export function formatearCantidad(cantidad, unidad = 'KG') {
  return `${CANTIDAD.format(cantidad)} ${unidad.toLowerCase()}`
}