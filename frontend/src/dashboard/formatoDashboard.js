// Cómo se muestran los indicadores del dashboard (no cambia los datos que envía el backend).

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const ENTERO = new Intl.NumberFormat('es-PE')
const UN_DECIMAL = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 })
const PORCENTAJE = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })

/** 248 → "248"; 1248 → "1,248". */
export function formatearEntero(numero) {
  return ENTERO.format(numero)
}

/** "2026-05" → "May" (etiqueta bajo cada barra del gráfico). */
export function nombreMes(mes) {
  const numero = Number(mes.split('-')[1])
  return MESES[numero - 1]
}

/** Monto corto encima de cada barra: 118 → "118", 268040 → "268 mil", 1500000 → "1.5 M". */
export function montoCorto(monto) {
  if (monto < 1000) return ENTERO.format(Math.round(monto))
  if (monto < 1000000) return `${ENTERO.format(Math.round(monto / 1000))} mil`
  return `${UN_DECIMAL.format(monto / 1000000)} M`
}

/** 8.14 → "+8.1 %"; -5.36 → "-5.4 %"; null (antes fue 0) → null. */
export function textoVariacion(valor) {
  if (valor === null) return null
  return `${PORCENTAJE.format(valor)} %`
}

/** "2026-10-01", "2026-10-31" → "01/10/2026 – 31/10/2026" (texto junto al ícono de calendario). */
export function textoRango(desde, hasta) {
  const aDiaMesAnio = (fecha) => fecha.split('-').reverse().join('/')
  return `${aDiaMesAnio(desde)} – ${aDiaMesAnio(hasta)}`
}