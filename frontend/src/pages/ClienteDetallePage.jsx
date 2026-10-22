import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import { pedir } from '../api/http.js'
import { formatearFecha, formatearTelefono, nombreTipoCliente } from '../clientes/formatoCliente.js'
import { IconoEditar, IconoVolver } from '../components/Iconos.jsx'
import InsigniaTipoCliente from '../components/InsigniaTipoCliente.jsx'
import { puedeEditarClientes } from '../sesion/permisos.js'
import { useSesion } from '../sesion/useSesion.js'

/** CU06 Ver detalle del cliente (pantalla 04 del prototipo). */
export default function ClienteDetallePage() {
  const { id } = useParams() // "/clientes/5" → id = "5"
  const { usuario } = useSesion()
  const [respuesta, setRespuesta] = useState({ id: null, cliente: null, error: null })

  // Un id que no es número no puede existir: ni siquiera se consulta al servidor
  const idValido = /^\d+$/.test(id)

  useEffect(() => {
    if (!idValido) return
    let vigente = true
    pedir(`/clientes/${id}`)
      .then((cliente) => {
        if (vigente) setRespuesta({ id, cliente, error: null })
      })
      .catch((error) => {
        if (vigente) setRespuesta({ id, cliente: null, error })
      })
    return () => {
      vigente = false
    }
  }, [id, idValido])

  const volver = (
    <Link to="/clientes" className="sel-volver mb-3">
      <IconoVolver />
      Volver a clientes
    </Link>
  )

  if (!idValido || respuesta.error?.estado === 404) {
    return (
      <section>
        {volver}
        <div className="alert alert-warning">No existe un cliente con ese identificador.</div>
      </section>
    )
  }

  if (respuesta.id !== id) {
    return (
      <section>
        {volver}
        <p className="text-secondary">Cargando cliente…</p>
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

  const cliente = respuesta.cliente
  const datos = [
    ['Tipo de documento', cliente.tipoDocumento],
    ['N.° de documento', cliente.numeroDocumento],
    ['Razón social', cliente.razonSocial],
    ['Tipo de cliente', nombreTipoCliente(cliente.tipoCliente)],
    ['Persona de contacto', cliente.personaContacto ?? '—'],
    ['Teléfono', formatearTelefono(cliente.telefono)],
    ['Correo', cliente.correo ?? '—'],
    ['Dirección', cliente.direccion ?? '—'],
    ['Registrado por', `${cliente.registradoPor} · ${formatearFecha(cliente.fechaRegistro)}`],
    ['Última edición', cliente.editadoPor ? `${cliente.editadoPor} · ${formatearFecha(cliente.fechaEdicion)}` : 'Sin ediciones'],
  ]

  return (
    <section>
      {volver}

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <h1 className="h3 mb-0">{cliente.razonSocial}</h1>
          <InsigniaTipoCliente tipo={cliente.tipoCliente} />
        </div>
        {puedeEditarClientes(usuario) && (
          <Link to={`/clientes/${cliente.id}/editar`} className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
            <IconoEditar />
            Editar cliente
          </Link>
        )}
      </div>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm sel-form-tarjeta">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Datos del cliente</h2>
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
        </div>

        <div className="col-12 col-lg-7">
          <div className="card shadow-sm sel-form-tarjeta">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Ventas del cliente</h2>
              <p className="text-secondary mb-0">
                Las ventas del cliente se mostrarán aquí con el módulo de ventas (M3, CU09).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}