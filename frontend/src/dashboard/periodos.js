// Reglas del CU14 en el navegador (contrato M4, sección 1): los botones de periodo se convierten
// en fechas desde/hasta, y el rango elegido se valida igual que en el backend (DashboardServicio).

import { aTextoFecha } from '../ventas/reglasVenta'

const MAXIMO_DIAS = 366
const MS_POR_DIA = 24 * 60 * 60 * 1000

/** Botones del selector de la pantalla 02, en el orden del prototipo. */
export const PERIODOS = [
  { clave: 'hoy', texto: 'Hoy' },
  { clave: 'mes', texto: 'Este mes' },
  { clave: 'trimestre', texto: 'Trimestre' },
  { clave: 'anio', texto: 'Año' },
]

export const PERIODO_INICIAL = 'mes'

/** Clave del botón → { desde, hasta } "AAAA-MM-DD". "hoy" se puede pasar para probar otras fechas. */
export function rangoDe(clave, hoy = new Date()) {
  const anio = hoy.getFullYear()
  const mes = hoy.getMonth() // 0 = enero

  switch (clave) {
    case 'hoy':
      return { desde: aTextoFecha(hoy), hasta: aTextoFecha(hoy) }
    case 'trimestre': {
      const primerMes = mes - (mes % 3) // 0, 3, 6 o 9
      return {
        desde: aTextoFecha(new Date(anio, primerMes, 1)),
        hasta: aTextoFecha(new Date(anio, primerMes + 3, 0)), // día 0 = último del mes anterior
      }
    }
    case 'anio':
      return { desde: `${anio}-01-01`, hasta: `${anio}-12-31` }
    default: // 'mes'
      return {
        desde: aTextoFecha(new Date(anio, mes, 1)),
        hasta: aTextoFecha(new Date(anio, mes + 1, 0)),
      }
  }
}

/** Días entre dos fechas "AAAA-MM-DD", incluyendo ambas (Date.UTC evita saltos por cambio de hora). */
function diasIncluidos(desde, hasta) {
  const [a1, m1, d1] = desde.split('-').map(Number)
  const [a2, m2, d2] = hasta.split('-').map(Number)
  return (Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / MS_POR_DIA + 1
}

/** Rango personalizado → { campo: mensaje } con los mismos campos y mensajes del backend. */
export function validarRango({ desde, hasta }) {
  if (!desde) return { desde: 'Indica la fecha de inicio del periodo.' }
  if (!hasta) return { hasta: 'Indica la fecha de fin del periodo.' }
  // Las fechas "AAAA-MM-DD" se pueden comparar como texto: el orden alfabético coincide con el de las fechas
  if (desde > hasta) return { hasta: 'La fecha final no puede ser anterior a la inicial.' }
  if (diasIncluidos(desde, hasta) > MAXIMO_DIAS) return { hasta: 'El periodo admite hasta 366 días.' }
  return {}
}

/** Variación porcentual frente al periodo anterior; null si antes fue 0 (no se divide entre 0). */
export function variacion(actual, anterior) {
  if (!anterior) return null
  return ((actual - anterior) / anterior) * 100
}