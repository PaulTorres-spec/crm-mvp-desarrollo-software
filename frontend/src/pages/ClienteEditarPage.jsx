import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { pedir } from '../api/http.js'
import { clienteAFormulario, prepararEdicion, validarCliente } from '../clientes/reglasCliente.js'
import { useFormularioCliente } from '../clientes/useFormularioCliente.js'
import FormularioCliente from '../components/FormularioCliente.jsx'
import { IconoEditar, IconoVolver } from '../components/Iconos.jsx'

/** CU07 Editar cliente (pantalla 07 del prototipo). */
export default function ClienteEditarPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const formulario = useFormularioCliente(null) // null hasta que llegue el cliente
  const { setDatos } = formulario
  const [carga, setCarga] = useState({ id: null, nombre: '', error: null })
  const [enviando, setEnviando] = useState(false)

  const idValido = /^\d+$/.test(id)
  const rutaDetalle = `/clientes/${id}`

  // 1. Traer el cliente y rellenar el formulario con sus datos actuales
  useEffect(() => {
    if (!idValido) return
    let vigente = true
    pedir(`/clientes/${id}`)
      .then((cliente) => {
        if (!vigente) return
        setDatos(clienteAFormulario(cliente))
        setCarga({ id, nombre: cliente.razonSocial, error: null })
      })
      .catch((error) => {
        if (vigente) setCarga({ id, nombre: '', error })
      })
    return () => {
      vigente = false
    }
  }, [id, idValido, setDatos])

  // 2. Guardar los cambios
  async function manejarEnvio(evento) {
    evento.preventDefault()
    if (formulario.mostrarErrores(validarCliente(formulario.datos))) return

    setEnviando(true)
    try {
      const cliente = await pedir(`/clientes/${id}`, { metodo: 'PUT', cuerpo: prepararEdicion(formulario.datos) })
      navigate(rutaDetalle, { state: { exito: `Cambios guardados en "${cliente.razonSocial}".` } })
    } catch (error) {
      if (error.estado === 400) {
        formulario.mostrarErrores(Object.fromEntries(error.errores.map((e) => [e.campo, e.mensaje])))
      } else {
        // 403 sin permiso, 404 si lo borraron mientras tanto, servidor apagado, etc.
        formulario.mostrarFallo(error.message)
      }
    } finally {
      setEnviando(false)
    }
  }

  const volver = (
    <Link to={idValido ? rutaDetalle : '/clientes'} className="sel-volver mb-3">
      <IconoVolver />
      {idValido ? 'Volver al detalle' : 'Volver a clientes'}
    </Link>
  )

  if (!idValido || carga.error?.estado === 404) {
    return (
      <section>
        {volver}
        <div className="alert alert-warning">No existe un cliente con ese identificador.</div>
      </section>
    )
  }

  if (carga.error) {
    return (
      <section>
        {volver}
        <div className="alert alert-danger" role="alert">{carga.error.message}</div>
      </section>
    )
  }

  if (carga.id !== id || !formulario.datos) {
    return (
      <section>
        {volver}
        <p className="text-secondary">Cargando cliente…</p>
      </section>
    )
  }

  return (
    <section>
      {volver}
      <h1 className="h3 mb-4">Editar cliente</h1>

      <FormularioCliente
        datos={formulario.datos}
        errores={formulario.errores}
        mensajeError={formulario.mensajeError}
        enviando={enviando}
        alCambiar={formulario.cambiar}
        alEnviar={manejarEnvio}
        documentoBloqueado
        aviso={
          <div className="alert sel-aviso-edicion d-flex align-items-center gap-2 fw-medium">
            <IconoEditar />
            Editando: {carga.nombre} · Se aplican las mismas validaciones del registro (CU04).
          </div>
        }
        textoGuardar="Guardar cambios"
        textoGuardando="Guardando…"
        rutaCancelar={rutaDetalle}
      />
    </section>
  )
}