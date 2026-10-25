import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'

import { pedir } from '../api/http.js'
import { formatearDocumento } from '../clientes/formatoCliente.js'
import { IconoAgregar, IconoAlerta, IconoCheck, IconoEliminar, IconoVolver } from '../components/Iconos.jsx'
import InsigniaTipoCliente from '../components/InsigniaTipoCliente.jsx'
import SelectorCliente from '../components/SelectorCliente.jsx'
import { formatearCantidad, formatearSoles } from '../ventas/formatoVenta.js'
import {
  ITEM_VACIO,
  MAX_ITEMS,
  calcularResumen,
  fechaDeHoy,
  prepararVenta,
  subtotalItem,
  validarVenta,
  ventaVacia,
} from '../ventas/reglasVenta.js'

/** CU08 Registrar venta + CU09 Asociar venta a cliente (pantalla 09 del prototipo). */
export default function VentaNuevaPage() {
  const navigate = useNavigate()
    const location = useLocation()
  // Si viene desde el detalle de un cliente (pantalla 04), ese cliente ya llega elegido
  const [datos, setDatos] = useState(() => ({ ...ventaVacia(), cliente: location.state?.cliente ?? null }))
  const [errores, setErrores] = useState({})
  const [mensajeError, setMensajeError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [catalogo, setCatalogo] = useState({ productos: [], error: '' })

  // Catálogo de productos: se pide una sola vez al abrir la página
  useEffect(() => {
    let vigente = true
    pedir('/productos')
      .then((productos) => {
        if (vigente) setCatalogo({ productos, error: '' })
      })
      .catch((error) => {
        if (vigente) setCatalogo({ productos: [], error: error.message })
      })
    return () => {
      vigente = false
    }
  }, [])

  // Vista previa: se recalcula en cada render a partir de las filas (estado derivado)
  const resumen = calcularResumen(datos.items)

  // Clase del input: agrega is-invalid (borde rojo) si el campo tiene error
  const clase = (campo, base = 'form-control') => (errores[campo] ? `${base} is-invalid` : base)

  function quitarError(campo) {
    setErrores((anteriores) => ({ ...anteriores, [campo]: null }))
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setDatos((anteriores) => ({ ...anteriores, [name]: value }))
    quitarError(name)
  }

  function elegirCliente(cliente) {
    setDatos((anteriores) => ({ ...anteriores, cliente }))
    quitarError('clienteId')
  }

  /** Cambia un campo de la fila i. Al elegir un producto, precarga su precio referencial. */
  function cambiarItem(i, campo, valor) {
    setDatos((anteriores) => ({
      ...anteriores,
      items: anteriores.items.map((item, j) => {
        if (j !== i) return item
        const nuevo = { ...item, [campo]: valor }
        if (campo === 'productoId') {
          const producto = catalogo.productos.find((p) => String(p.id) === valor)
          if (producto) nuevo.precioUnitario = producto.precioReferencial.toFixed(2)
        }
        return nuevo
      }),
    }))
    quitarError(`items[${i}].${campo}`)
  }

  function agregarItem() {
    setDatos((anteriores) => ({ ...anteriores, items: [...anteriores.items, { ...ITEM_VACIO }] }))
    quitarError('items')
  }

  function quitarItem(i) {
    setDatos((anteriores) => ({ ...anteriores, items: anteriores.items.filter((_, j) => j !== i) }))
    // Los errores usan la posición de la fila: al quitar una, las posiciones cambian
    setErrores((anteriores) =>
      Object.fromEntries(Object.entries(anteriores).filter(([campo]) => !campo.startsWith('items'))),
    )
  }

  // Guarda los errores por campo y arma la alerta superior. Devuelve true si hay errores.
  function mostrarErrores(nuevos) {
    const cantidad = Object.keys(nuevos).length
    setErrores(nuevos)
    if (cantidad === 0) setMensajeError('')
    else if (cantidad === 1) setMensajeError('No se pudo registrar la venta. Corrige el campo marcado en rojo.')
    else setMensajeError(`No se pudo registrar la venta. Corrige los ${cantidad} campos marcados en rojo.`)
    return cantidad > 0
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()

    // 1. Reglas en el navegador: si algo falla, no molestamos al servidor
    if (mostrarErrores(validarVenta(datos))) return

    // 2. El backend vuelve a validar, calcula los montos y genera el número
    setEnviando(true)
    try {
      const venta = await pedir('/ventas', { metodo: 'POST', cuerpo: prepararVenta(datos) })
      navigate('/ventas', {
        state: {
          exito: `Venta ${venta.numero} registrada a ${venta.cliente.razonSocial} por ${formatearSoles(venta.total)}.`,
        },
      })
    } catch (error) {
      if (error.estado === 400) {
        // 400 VALIDACION: el backend dice qué campo falló (mismos nombres que en el navegador)
        mostrarErrores(Object.fromEntries(error.errores.map((e) => [e.campo, e.mensaje])))
      } else {
        // 403 sin permiso, servidor apagado, etc.
        setErrores({})
        setMensajeError(error.message)
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section>
      <Link to="/ventas" className="sel-volver mb-3">
        <IconoVolver />
        Volver a ventas
      </Link>
      <h1 className="h3 mb-4">Registrar venta</h1>

      {/* El form envuelve las dos columnas: así el botón del resumen también envía */}
      <form className="row g-4 align-items-start" onSubmit={manejarEnvio} noValidate>
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm sel-form-tarjeta">
            <div className="card-body p-4">
              {mensajeError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 fw-medium" role="alert">
                  <IconoAlerta />
                  {mensajeError}
                </div>
              )}
              {catalogo.error && (
                <div className="alert alert-warning" role="alert">
                  No se pudo cargar el catálogo de productos: {catalogo.error}
                </div>
              )}

              <h2 className="h5 mb-3">Datos de la venta</h2>
              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <label htmlFor="cliente" className="form-label fw-medium">Cliente *</label>
                  <SelectorCliente cliente={datos.cliente} alElegir={elegirCliente} error={errores.clienteId} />
                </div>
                <div className="col-12 col-md-4">
                  <label htmlFor="fecha" className="form-label fw-medium">Fecha *</label>
                  <input id="fecha" name="fecha" type="date" max={fechaDeHoy()}
                    className={clase('fecha')} value={datos.fecha} onChange={cambiarCampo} />
                  <ErrorCampo mensaje={errores.fecha} />
                </div>
              </div>

              <hr className="my-4" />

              <h2 className="h5 mb-3">Detalle de productos</h2>
              <div className="table-responsive">
                <table className="table sel-tabla-items mb-2">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad (kg)</th>
                      <th>Precio unit. (S/)</th>
                      <th className="text-end">Subtotal</th>
                      <th><span className="visually-hidden">Quitar</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.items.map((item, i) => {
                      const subtotal = subtotalItem(item)
                      return (
                        // key = posición: sirve porque los inputs son controlados (su valor vive en "datos")
                        <tr key={i}>
                          <td>
                            <select aria-label={`Producto de la fila ${i + 1}`}
                              className={clase(`items[${i}].productoId`, 'form-select')}
                              value={item.productoId} onChange={(e) => cambiarItem(i, 'productoId', e.target.value)}>
                              <option value="">Selecciona…</option>
                              {catalogo.productos.map((p) => (
                                <option key={p.id} value={String(p.id)}>{p.nombre}</option>
                              ))}
                            </select>
                            <ErrorCampo mensaje={errores[`items[${i}].productoId`]} />
                          </td>
                          <td>
                            <input inputMode="decimal" aria-label={`Cantidad de la fila ${i + 1}`}
                              className={clase(`items[${i}].cantidad`)}
                              value={item.cantidad} onChange={(e) => cambiarItem(i, 'cantidad', e.target.value)} />
                            <ErrorCampo mensaje={errores[`items[${i}].cantidad`]} />
                          </td>
                          <td>
                            <input inputMode="decimal" aria-label={`Precio unitario de la fila ${i + 1}`}
                              className={clase(`items[${i}].precioUnitario`)}
                              value={item.precioUnitario}
                              onChange={(e) => cambiarItem(i, 'precioUnitario', e.target.value)} />
                            <ErrorCampo mensaje={errores[`items[${i}].precioUnitario`]} />
                          </td>
                          <td className="text-end fw-medium sel-subtotal-item">
                            {subtotal === null ? '—' : formatearSoles(subtotal / 100)}
                          </td>
                          <td className="text-end">
                            <button type="button" className="btn btn-link text-secondary p-1"
                              aria-label={`Quitar la fila ${i + 1}`} title="Quitar producto"
                              onClick={() => quitarItem(i)} disabled={datos.items.length === 1}>
                              <IconoEliminar />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <ErrorCampo mensaje={errores.items} />
              <button type="button" className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2"
                onClick={agregarItem} disabled={datos.items.length >= MAX_ITEMS}>
                <IconoAgregar />
                Agregar producto
              </button>

              <hr className="my-4" />

              <label htmlFor="observaciones" className="form-label fw-medium">Observaciones</label>
              <textarea id="observaciones" name="observaciones" rows={3} maxLength={300}
                className={clase('observaciones')} value={datos.observaciones} onChange={cambiarCampo} />
              {errores.observaciones ? (
                <ErrorCampo mensaje={errores.observaciones} />
              ) : (
                <div className="form-text">{datos.observaciones.length}/300 caracteres</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <aside className="card shadow-sm sel-resumen-venta">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Resumen</h2>
              {datos.cliente ? (
                <div className="mb-3">
                  <div className="fw-medium">{datos.cliente.razonSocial}</div>
                  <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
                    <InsigniaTipoCliente tipo={datos.cliente.tipoCliente} />
                    <small className="text-secondary">{formatearDocumento(datos.cliente)}</small>
                  </div>
                </div>
              ) : (
                <p className="text-secondary mb-3">Aún no has elegido un cliente.</p>
              )}

              <dl className="sel-resumen-montos">
                <dt>Productos</dt>
                <dd>
                  {resumen.items} {resumen.items === 1 ? 'ítem' : 'ítems'} · {formatearCantidad(resumen.cantidad)}
                </dd>
                <dt>Subtotal</dt>
                <dd>{formatearSoles(resumen.subtotal / 100)}</dd>
                <dt>IGV (18 %)</dt>
                <dd>{formatearSoles(resumen.igv / 100)}</dd>
                <dt className="sel-resumen-total">Total</dt>
                <dd className="sel-resumen-total">{formatearSoles(resumen.total / 100)}</dd>
              </dl>

              <button type="submit" disabled={enviando}
                className="btn btn-primary w-100 d-inline-flex justify-content-center align-items-center gap-2">
                <IconoCheck />
                {enviando ? 'Registrando…' : 'Registrar venta'}
              </button>
              <Link to="/ventas" className="btn btn-link w-100 text-secondary text-decoration-none mt-1">
                Cancelar
              </Link>
              <small className="text-secondary d-block mt-2">
                Montos referenciales: el sistema los vuelve a calcular al registrar.
              </small>
            </div>
          </aside>
        </div>
      </form>
    </section>
  )
}

/** Mensaje rojo debajo de un campo (no dibuja nada si no hay error). */
function ErrorCampo({ mensaje }) {
  return mensaje ? <div className="invalid-feedback d-block">{mensaje}</div> : null
}