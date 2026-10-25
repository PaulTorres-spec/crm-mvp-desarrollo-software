import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import { pedir } from '../api/http.js'
import { formatearDocumento, formatearFecha } from '../clientes/formatoCliente.js'
import { IconoVolver } from '../components/Iconos.jsx'
import InsigniaTipoCliente from '../components/InsigniaTipoCliente.jsx'
import { formatearCantidad, formatearSoles } from '../ventas/formatoVenta.js'

/** CU10 Ver detalle de una venta: cliente, productos y montos (GET /api/ventas/{id}). */
export default function VentaDetallePage() {
  const { id } = useParams() // "/ventas/4" → id = "4"
  const [respuesta, setRespuesta] = useState({ id: null, venta: null, error: null })

  // Un id que no es número no puede existir: ni siquiera se consulta al servidor
  const idValido = /^\d+$/.test(id)

  useEffect(() => {
    if (!idValido) return
    let vigente = true
    pedir(`/ventas/${id}`)
      .then((venta) => {
        if (vigente) setRespuesta({ id, venta, error: null })
      })
      .catch((error) => {
        if (vigente) setRespuesta({ id, venta: null, error })
      })
    return () => {
      vigente = false
    }
  }, [id, idValido])

  const volver = (
    <Link to="/ventas" className="sel-volver mb-3">
      <IconoVolver />
      Volver a ventas
    </Link>
  )

  if (!idValido || respuesta.error?.estado === 404) {
    return (
      <section>
        {volver}
        <div className="alert alert-warning">No existe una venta con ese identificador.</div>
      </section>
    )
  }

  if (respuesta.id !== id) {
    return (
      <section>
        {volver}
        <p className="text-secondary">Cargando venta…</p>
      </section>
    )
  }

  if (respuesta.error) {
    return (
      <section>
        {volver}
        <div className="alert alert-danger" role="alert">{respuesta.error.message}</div>
      </section>
    )
  }

  const venta = respuesta.venta
  // Suma de kilos en centésimas enteras (evita 0.1 + 0.2 = 0.30000000000000004)
  const cantidadTotal = venta.items.reduce((suma, item) => suma + Math.round(item.cantidad * 100), 0) / 100

  const datos = [
    ['Cliente', <Link key="c" to={`/clientes/${venta.cliente.id}`}>{venta.cliente.razonSocial}</Link>],
    ['Documento', formatearDocumento(venta.cliente)],
    ['Tipo de cliente', <InsigniaTipoCliente key="t" tipo={venta.cliente.tipoCliente} />],
    ['Fecha de la venta', formatearFecha(venta.fecha)],
    ['Registrado por', `${venta.registradoPor} · ${formatearFecha(venta.fechaRegistro)}`],
    ['Observaciones', venta.observaciones ?? '—'],
  ]

  return (
    <section>
      {volver}

      <div className="d-flex flex-wrap align-items-baseline gap-3 mb-4">
        <h1 className="h3 mb-0">Venta {venta.numero}</h1>
        <span className="text-secondary">{formatearFecha(venta.fecha)}</span>
      </div>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm sel-form-tarjeta mb-4">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Datos de la venta</h2>
              <dl className="sel-datos mb-0">
                {datos.map(([etiqueta, valor]) => (
                  <div key={etiqueta} className="sel-dato">
                    <dt>{etiqueta}</dt>
                    <dd>{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="card shadow-sm sel-tabla-tarjeta">
            <div className="card-body p-4 pb-2">
              <h2 className="h5 mb-0">Detalle de productos</h2>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 sel-tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="text-end">Cantidad</th>
                    <th className="text-end">Precio unit.</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.items.map((item) => (
                    <tr key={item.productoId}>
                      <td>
                        <div className="fw-semibold">{item.nombre}</div>
                        <small className="text-secondary">{item.codigo}</small>
                      </td>
                      <td className="text-end text-nowrap">{formatearCantidad(item.cantidad, item.unidadMedida)}</td>
                      <td className="text-end text-nowrap">{formatearSoles(item.precioUnitario)}</td>
                      <td className="text-end text-nowrap fw-semibold">{formatearSoles(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <aside className="card shadow-sm sel-resumen-venta">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Resumen</h2>
              <dl className="sel-resumen-montos mb-0">
                <dt>Productos</dt>
                <dd>
                  {venta.items.length} {venta.items.length === 1 ? 'ítem' : 'ítems'} · {formatearCantidad(cantidadTotal)}
                </dd>
                <dt>Subtotal</dt>
                <dd>{formatearSoles(venta.subtotal)}</dd>
                <dt>IGV (18 %)</dt>
                <dd>{formatearSoles(venta.igv)}</dd>
                <dt className="sel-resumen-total">Total</dt>
                <dd className="sel-resumen-total">{formatearSoles(venta.total)}</dd>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}