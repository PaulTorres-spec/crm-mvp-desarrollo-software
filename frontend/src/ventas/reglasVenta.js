// Reglas del CU08 en el navegador: las mismas del backend (VentaSolicitud y VentaServicio),
// para avisar antes de enviar. El backend vuelve a validar y es quien calcula los montos de verdad.

export const MAX_ITEMS = 20
const MAXIMO = 99999.99
const HASTA_DOS_DECIMALES = /^\d+(\.\d{1,2})?$/

/** Fecha de hoy "AAAA-MM-DD" según el reloj de la PC (toISOString usaría UTC: de noche daría mañana). */
export function fechaDeHoy() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

/** Una fila vacía. Los números se guardan como texto, tal como los escribe el usuario. */
export const ITEM_VACIO = { productoId: '', cantidad: '', precioUnitario: '' }

/** Estado inicial del formulario: sin cliente, fecha de hoy y una fila vacía. */
export function ventaVacia() {
  return { cliente: null, fecha: fechaDeHoy(), observaciones: '', items: [{ ...ITEM_VACIO }] }
}

/** "28,50" o "28.5" → 28.5; texto inválido o con más de 2 decimales → null. */
export function leerNumero(texto) {
  const limpio = String(texto).trim().replace(',', '.')
  return HASTA_DOS_DECIMALES.test(limpio) ? Number(limpio) : null
}

/** Mensaje de error de una cantidad o un precio, o null si está bien. */
function errorDeMonto(texto, nombre) {
  const numero = leerNumero(texto)
  if (numero === null) return `Ingresa ${nombre} con hasta 2 decimales.`
  if (numero <= 0) return `${nombre === 'la cantidad' ? 'La cantidad' : 'El precio'} debe ser mayor que 0.`
  if (numero > MAXIMO) return `${nombre === 'la cantidad' ? 'La cantidad' : 'El precio'} no puede superar 99 999,99.`
  return null
}

/** Devuelve { campo: mensaje } con los mismos nombres de campo que usa el backend (items[0].cantidad…). */
export function validarVenta(datos) {
  const errores = {}

  if (!datos.cliente) errores.clienteId = 'Selecciona un cliente.'

  if (!datos.fecha) errores.fecha = 'La fecha es obligatoria.'
  else if (datos.fecha > fechaDeHoy()) errores.fecha = 'La fecha no puede ser futura.'

  if (datos.observaciones.trim().length > 300) {
    errores.observaciones = 'Las observaciones admiten hasta 300 caracteres.'
  }

  if (datos.items.length === 0) errores.items = 'Agrega al menos un producto.'

  const vistos = new Set()
  datos.items.forEach((item, i) => {
    if (!item.productoId) {
      errores[`items[${i}].productoId`] = 'Selecciona un producto.'
    } else if (vistos.has(item.productoId)) {
      errores[`items[${i}].productoId`] = 'El producto está repetido.'
    } else {
      vistos.add(item.productoId)
    }

    const errorCantidad = errorDeMonto(item.cantidad, 'la cantidad')
    if (errorCantidad) errores[`items[${i}].cantidad`] = errorCantidad

    const errorPrecio = errorDeMonto(item.precioUnitario, 'el precio')
    if (errorPrecio) errores[`items[${i}].precioUnitario`] = errorPrecio
  })

  return errores
}

/** JSON del POST /api/ventas: solo lo que pide el contrato (nada de subtotales ni total). */
export function prepararVenta(datos) {
  return {
    clienteId: datos.cliente.id,
    fecha: datos.fecha,
    observaciones: datos.observaciones.trim() || null,
    items: datos.items.map((item) => ({
      productoId: Number(item.productoId),
      cantidad: leerNumero(item.cantidad),
      precioUnitario: leerNumero(item.precioUnitario),
    })),
  }
}

// --- Vista previa de montos -----------------------------------------------------------
// En céntimos (números enteros): en JavaScript 0.1 + 0.2 da 0.30000000000000004.

const aCentimos = (numero) => Math.round(numero * 100)

/** Subtotal de una fila en céntimos (redondeo HALF_UP, igual que el backend) o null si faltan datos. */
export function subtotalItem(item) {
  const cantidad = leerNumero(item.cantidad)
  const precio = leerNumero(item.precioUnitario)
  if (cantidad === null || precio === null) return null
  return Math.round((aCentimos(cantidad) * aCentimos(precio)) / 100)
}

/** Resumen de la tarjeta lateral. Montos en céntimos; cantidad en kg. */
export function calcularResumen(items) {
  let subtotal = 0
  let cantidad = 0
  for (const item of items) {
    subtotal += subtotalItem(item) ?? 0
    cantidad += aCentimos(leerNumero(item.cantidad) ?? 0)
  }
  const igv = Math.round((subtotal * 18) / 100)
  return { items: items.length, cantidad: cantidad / 100, subtotal, igv, total: subtotal + igv }
}