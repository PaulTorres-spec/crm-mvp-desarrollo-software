import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import { pedir } from '../api/http.js'
import { formatearFecha } from '../clientes/formatoCliente.js'
import { formatearSoles } from '../ventas/formatoVenta.js'
import { IconoVer } from './Iconos.jsx'

const ULTIMAS = 5

/**
 * CU09/CU10 en la pantalla 04: indicadores y últimas ventas de un cliente.
 * Reutiliza GET /api/ventas con clienteId (contrato M3, sección 4): no hizo falta otro endpoint.
 */
export default function VentasDelCliente({ clienteId }) {
  const [respuesta, setRespuesta] = useState({ clienteId: null, datos: null, error: '' })

  useEffect(() => {
    let vigente = true
    const parametros = new URLSearchParams({ clienteId, tamano: ULTIMAS })
    pedir(`/ventas?${parametros}`)
      .then((datos) => {
        if (vigente) setRespuesta({ clienteId, datos, error: '' })
      })
      .catch((error) => {
        if (vigente) setRespuesta({ clienteId, datos: null, error: error.message })
      })
    return () => {
      vigente = false
    }
  }, [clienteId])

  if (respuesta.clienteId !== clienteId) return <p className="text-secondary mb-0">Cargando ventas…</p>
  if (respuesta.error) return <div className="alert alert-danger mb-0" role="alert">{respuesta.error}</div>

  const { datos } = respuesta
  if (datos.totalElementos === 0) {
    return <p className="text-secondary mb-0">Este cliente aún no tiene ventas registradas.</p>
  }

  return (
    <>
      <div className="row g-3 mb-3">
        <Indicador titulo="Ventas registradas" valor={datos.totalElementos} />
        <Indicador titulo="Monto total" valor={formatearSoles(datos.montoTotal)} />
        {/* Vienen ordenadas de la más reciente a la más antigua: la primera es la última compra */}
        <Indicador titulo="Última compra" valor={formatearFecha(datos.contenido[0].fecha)} />
      </div>

      <div className="table-responsive">
        <table className="table align-middle mb-0 sel-tabla">
          <thead>
            <tr>
              <th>N.° venta</th>
              <th>Fecha</th>
              <th>Registrado por</th>
              <th className="text-end">Total</th>
              <th className="text-end">Ver</th>
            </tr>
          </thead>
          <tbody>
            {datos.contenido.map((venta) => (
              <tr key={venta.id}>
                <td className="fw-semibold text-nowrap">{venta.numero}</td>
                <td className="text-nowrap">{formatearFecha(venta.fecha)}</td>
                <td>{venta.registradoPor}</td>
                <td className="text-end text-nowrap fw-semibold">{formatearSoles(venta.total)}</td>
                <td className="text-end">
                  <Link to={`/ventas/${venta.id}`} className="sel-accion" title="Ver detalle"
                    aria-label={`Ver detalle de la venta ${venta.numero}`}>
                    <IconoVer />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {datos.totalElementos > ULTIMAS && (
        <small className="text-secondary d-block mt-2">
          Se muestran las {ULTIMAS} ventas más recientes de {datos.totalElementos}.
        </small>
      )}
    </>
  )
}

/** Tarjeta pequeña con un número destacado. */
function Indicador({ titulo, valor }) {
  return (
    <div className="col-12 col-sm-4">
      <div className="sel-indicador">
        <div className="sel-indicador-titulo">{titulo}</div>
        <div className="sel-indicador-valor">{valor}</div>
      </div>
    </div>
  )
}