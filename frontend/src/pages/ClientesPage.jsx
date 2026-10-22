import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

import { pedir } from '../api/http.js'
import { formatearDocumento, formatearTelefono } from '../clientes/formatoCliente.js'
import { TIPOS_CLIENTE } from '../clientes/reglasCliente.js'
import { IconoAgregar, IconoBuscar, IconoEditar, IconoVer } from '../components/Iconos.jsx'
import InsigniaTipoCliente from '../components/InsigniaTipoCliente.jsx'
import Paginacion from '../components/Paginacion.jsx'
import { puedeEditarClientes, puedeRegistrarClientes } from '../sesion/permisos.js'
import { useSesion } from '../sesion/useSesion.js'

const TAMANO_PAGINA = 8

/** CU05 Buscar cliente (pantalla 03 del prototipo). */
export default function ClientesPage() {
  const { usuario } = useSesion()
  const location = useLocation()
  // Mensajes que pueden llegar desde otra página (registro exitoso o sin permiso)
  const exito = location.state?.exito
  const aviso = location.state?.aviso

  const [texto, setTexto] = useState('') // lo que el usuario está escribiendo
  const [textoBuscado, setTextoBuscado] = useState('') // lo que de verdad se busca
  const [tipo, setTipo] = useState('')
  const [pagina, setPagina] = useState(0)
  const [respuesta, setRespuesta] = useState({ consulta: null, datos: null, error: '' })

  // Debounce: busca 300 ms después de la última tecla, no en cada tecla
  useEffect(() => {
    const espera = setTimeout(() => {
      setTextoBuscado(texto.trim())
      setPagina(0)
    }, 300)
    return () => clearTimeout(espera) // si escribe otra tecla antes, se cancela la búsqueda pendiente
  }, [texto])

  // La consulta completa en forma de texto: "pagina=0&tamano=8&texto=gamarra"
  const parametros = new URLSearchParams({ pagina, tamano: TAMANO_PAGINA })
  if (textoBuscado) parametros.set('texto', textoBuscado)
  if (tipo) parametros.set('tipoCliente', tipo)
  const consulta = parametros.toString()

  // Pide la página cada vez que cambia la consulta
  useEffect(() => {
    let vigente = true // si llega una respuesta vieja (de una consulta anterior), se ignora
    pedir(`/clientes?${consulta}`)
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
  const hayFiltros = textoBuscado !== '' || tipo !== ''

  function cambiarTipo(evento) {
    setTipo(evento.target.value)
    setPagina(0)
  }

  return (
    <section>
      <h1 className="h3 mb-3">Clientes</h1>

      {exito && <div className="alert alert-success" role="status">{exito}</div>}
      {aviso && <div className="alert alert-warning" role="alert">{aviso}</div>}

      {/* Barra de búsqueda y filtros */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="sel-buscador flex-grow-1">
          <IconoBuscar />
          <input
            type="search"
            className="form-control"
            placeholder="Buscar por razón social, nombre, RUC o DNI…"
            aria-label="Buscar clientes"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>
        <select className="form-select sel-filtro" aria-label="Tipo de cliente" value={tipo} onChange={cambiarTipo}>
          <option value="">Tipo: Todos</option>
          {TIPOS_CLIENTE.map((t) => (
            <option key={t.valor} value={t.valor}>{t.texto}</option>
          ))}
        </select>
        {puedeRegistrarClientes(usuario) && (
          <Link to="/clientes/nuevo" className="btn btn-primary d-inline-flex align-items-center gap-2">
            <IconoAgregar />
            Registrar cliente
          </Link>
        )}
      </div>

      <div className="card shadow-sm sel-tabla-tarjeta">
        {respuesta.error && !cargando ? (
          <div className="alert alert-danger m-3" role="alert">{respuesta.error}</div>
        ) : !datos ? (
          <p className="text-secondary p-4 mb-0">Cargando clientes…</p>
        ) : datos.totalElementos === 0 ? (
          <p className="text-secondary p-4 mb-0">
            {hayFiltros ? 'No se encontraron clientes con esos filtros.' : 'Aún no hay clientes registrados.'}
          </p>
        ) : (
          <>
            <div className={`table-responsive ${cargando ? 'opacity-50' : ''}`}>
              <table className="table align-middle mb-0 sel-tabla">
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Razón social / Nombre</th>
                    <th>Tipo</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.contenido.map((cliente) => (
                    <tr key={cliente.id}>
                      <td className="text-nowrap">{formatearDocumento(cliente)}</td>
                      <td className="fw-semibold">{cliente.razonSocial}</td>
                      <td><InsigniaTipoCliente tipo={cliente.tipoCliente} /></td>
                      <td className="text-nowrap">{formatearTelefono(cliente.telefono)}</td>
                      <td>{cliente.correo ?? '—'}</td>
                      <td className="text-end text-nowrap">
                        <Link to={`/clientes/${cliente.id}`} className="sel-accion" title="Ver detalle"
                          aria-label={`Ver detalle de ${cliente.razonSocial}`}>
                          <IconoVer />
                        </Link>
                        {puedeEditarClientes(usuario) && (
                          <Link to={`/clientes/${cliente.id}/editar`} className="sel-accion" title="Editar"
                            aria-label={`Editar ${cliente.razonSocial}`}>
                            <IconoEditar />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-3">
              <small className="text-secondary">
                Mostrando {datos.pagina * datos.tamano + 1}–{datos.pagina * datos.tamano + datos.contenido.length} de{' '}
                {datos.totalElementos} {datos.totalElementos === 1 ? 'cliente' : 'clientes'}
              </small>
              <Paginacion pagina={datos.pagina} totalPaginas={datos.totalPaginas} alCambiar={setPagina} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}