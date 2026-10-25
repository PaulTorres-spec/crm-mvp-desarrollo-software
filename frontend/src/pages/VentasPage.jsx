import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

import { pedir } from '../api/http.js'
import { formatearFecha } from '../clientes/formatoCliente.js'
import { IconoAgregar, IconoVer } from '../components/Iconos.jsx'
import InsigniaTipoCliente from '../components/InsigniaTipoCliente.jsx'
import Paginacion from '../components/Paginacion.jsx'
import SelectorCliente from '../components/SelectorCliente.jsx'
import { puedeRegistrarVentas } from '../sesion/permisos.js'
import { useSesion } from '../sesion/useSesion.js'
import { formatearSoles } from '../ventas/formatoVenta.js'
import { rangoMesActual } from '../ventas/reglasVenta.js'

const TAMANO_PAGINA = 8

/** Filtros iniciales: el mes actual y todos los clientes (como en el prototipo). */
function filtrosIniciales() {
  return { ...rangoMesActual(), cliente: null }
}

/** CU10 Consultar ventas + CU11 Filtrar por fecha o cliente (pantalla 08 del prototipo). */
export default function VentasPage() {
  const { usuario } = useSesion()
  const location = useLocation()
  const exito = location.state?.exito // llega desde Registrar venta
  const aviso = location.state?.aviso // llega desde RutaConPermiso

  // "formulario" = lo que el usuario está eligiendo; "aplicados" = lo que de verdad se consulta.
  // Van separados porque la búsqueda se lanza con el botón Filtrar, no en cada cambio.
  const [formulario, setFormulario] = useState(filtrosIniciales)
  const [aplicados, setAplicados] = useState(filtrosIniciales)
  const [errorFiltro, setErrorFiltro] = useState('')
  const [pagina, setPagina] = useState(0)
  const [respuesta, setRespuesta] = useState({ consulta: null, datos: null, error: '' })

  // La consulta completa como texto: "pagina=0&tamano=8&desde=2026-10-01&hasta=2026-10-31&clienteId=1"
  const parametros = new URLSearchParams({ pagina, tamano: TAMANO_PAGINA })
  if (aplicados.desde) parametros.set('desde', aplicados.desde)
  if (aplicados.hasta) parametros.set('hasta', aplicados.hasta)
  if (aplicados.cliente) parametros.set('clienteId', aplicados.cliente.id)
  const consulta = parametros.toString()

  // Pide la página cada vez que cambia la consulta (mismo patrón que ClientesPage)
  useEffect(() => {
    let vigente = true
    pedir(`/ventas?${consulta}`)
      .then((datos) => {
        if (vigente) setRespuesta({ consulta, datos, error: '' })
      })
      .catch((error) => {
        if (vigente) setRespuesta({ consulta, datos: null, error: error.message })
      })
    return () => {
      vigente = false
    }
  }, [consulta])

  const cargando = respuesta.consulta !== consulta
  const datos = respuesta.datos

  function cambiarFecha(evento) {
    const { name, value } = evento.target
    setFormulario((anteriores) => ({ ...anteriores, [name]: value }))
    setErrorFiltro('')
  }

  function filtrar(evento) {
    evento.preventDefault()
    if (formulario.desde && formulario.hasta && formulario.desde > formulario.hasta) {
      setErrorFiltro('La fecha final no puede ser anterior a la inicial.')
      return
    }
    setAplicados(formulario)
    setPagina(0)
  }

  function limpiar() {
    const iniciales = filtrosIniciales()
    setFormulario(iniciales)
    setAplicados(iniciales)
    setErrorFiltro('')
    setPagina(0)
  }

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h3 mb-0">Ventas</h1>
        {puedeRegistrarVentas(usuario) && (
          <Link to="/ventas/nueva" className="btn btn-primary d-inline-flex align-items-center gap-2">
            <IconoAgregar />
            Registrar venta
          </Link>
        )}
      </div>

      {exito && <div className="alert alert-success" role="status">{exito}</div>}
      {aviso && <div className="alert alert-warning" role="alert">{aviso}</div>}

      {/* Filtros (CU11) */}
      <form className="card shadow-sm mb-3" onSubmit={filtrar} noValidate>
        <div className="card-body">
          <div className="row g-3 align-items-start">
            <div className="col-6 col-lg-2">
              <label htmlFor="desde" className="form-label fw-medium">Desde</label>
              <input id="desde" name="desde" type="date" className="form-control"
                value={formulario.desde} onChange={cambiarFecha} />
            </div>
            <div className="col-6 col-lg-2">
              <label htmlFor="hasta" className="form-label fw-medium">Hasta</label>
              <input id="hasta" name="hasta" type="date"
                className={errorFiltro ? 'form-control is-invalid' : 'form-control'}
                value={formulario.hasta} onChange={cambiarFecha} />
            </div>
            <div className="col-12 col-lg-5">
              <label htmlFor="cliente" className="form-label fw-medium">Cliente</label>
              <SelectorCliente
                cliente={formulario.cliente}
                alElegir={(cliente) => setFormulario((anteriores) => ({ ...anteriores, cliente }))}
              />
            </div>
            <div className="col-12 col-lg-3 d-flex align-items-center gap-2 sel-filtros-acciones">
              <button type="submit" className="btn btn-primary">Filtrar</button>
              <button type="button" className="btn btn-link text-secondary text-decoration-none" onClick={limpiar}>
                Limpiar
              </button>
            </div>
          </div>
          {errorFiltro && <div className="invalid-feedback d-block">{errorFiltro}</div>}
        </div>
      </form>

      {/* Chips: cantidad y monto de TODO el rango (no solo de la página) */}
      {datos && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          <span className="sel-chip">
            {datos.totalElementos} {datos.totalElementos === 1 ? 'venta' : 'ventas'} en el rango
          </span>
          <span className="sel-chip sel-chip-total">Total: {formatearSoles(datos.montoTotal)}</span>
        </div>
      )}

      <div className="card shadow-sm sel-tabla-tarjeta">
        {respuesta.error && !cargando ? (
          <div className="alert alert-danger m-3" role="alert">{respuesta.error}</div>
        ) : !datos ? (
          <p className="text-secondary p-4 mb-0">Cargando ventas…</p>
        ) : datos.totalElementos === 0 ? (
          <p className="text-secondary p-4 mb-0">No hay ventas con esos filtros.</p>
        ) : (
          <>
            <div className={`table-responsive ${cargando ? 'opacity-50' : ''}`}>
              <table className="table align-middle mb-0 sel-tabla">
                <thead>
                  <tr>
                    <th>N.° venta</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
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
                      <td>
                        <Link to={`/clientes/${venta.clienteId}`} className="text-decoration-none">
                          {venta.clienteRazonSocial}
                        </Link>
                      </td>
                      <td><InsigniaTipoCliente tipo={venta.tipoCliente} /></td>
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

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-3">
              <small className="text-secondary">
                Mostrando {datos.pagina * datos.tamano + 1}–{datos.pagina * datos.tamano + datos.contenido.length} de{' '}
                {datos.totalElementos} {datos.totalElementos === 1 ? 'venta' : 'ventas'}
              </small>
              <Paginacion pagina={datos.pagina} totalPaginas={datos.totalPaginas} alCambiar={setPagina} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}