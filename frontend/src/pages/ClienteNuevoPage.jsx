import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { pedir } from '../api/http.js'
import { CLIENTE_VACIO, prepararCliente, validarCliente } from '../clientes/reglasCliente.js'
import FormularioCliente from '../components/FormularioCliente.jsx'
import { IconoVolver } from '../components/Iconos.jsx'

/** CU03 Registrar cliente + CU04 Validar datos (pantallas 05 y 06 del prototipo). */
export default function ClienteNuevoPage() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(CLIENTE_VACIO)
  const [errores, setErrores] = useState({})
  const [mensajeError, setMensajeError] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Un solo manejador para todos los campos: usa el atributo name del input
  function cambiar(evento) {
    const { name, value } = evento.target
    setDatos((anteriores) => ({ ...anteriores, [name]: value }))
    // El usuario está corrigiendo ese campo: quitamos su mensaje de error
    setErrores((anteriores) => ({ ...anteriores, [name]: null }))
  }

  // Guarda los errores y arma la alerta superior. Devuelve true si hay errores.
  function mostrarErrores(nuevos) {
    const cantidad = Object.keys(nuevos).length
    setErrores(nuevos)
    if (cantidad === 0) {
      setMensajeError('')
    } else if (cantidad === 1) {
      setMensajeError('No se pudo guardar el cliente. Corrige el campo marcado en rojo.')
    } else {
      setMensajeError(`No se pudo guardar el cliente. Corrige los ${cantidad} campos marcados en rojo.`)
    }
    return cantidad > 0
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()

    // 1. Reglas del CU04 en el navegador: si algo falla, no molestamos al servidor
    if (mostrarErrores(validarCliente(datos))) return

    // 2. Enviamos al backend, que vuelve a validar y revisa duplicados
    setEnviando(true)
    try {
      const cliente = await pedir('/clientes', { metodo: 'POST', cuerpo: prepararCliente(datos) })
      navigate('/clientes', {
        state: { exito: `Cliente "${cliente.razonSocial}" registrado correctamente.` },
      })
    } catch (error) {
      if (error.estado === 400 || error.estado === 409) {
        // 400 VALIDACION o 409 DUPLICADO: el backend dice qué campo falló
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
      <Link to="/clientes" className="sel-volver mb-3">
        <IconoVolver />
        Volver a clientes
      </Link>
      <h1 className="h3 mb-4">Registrar cliente</h1>

      <FormularioCliente
        datos={datos}
        errores={errores}
        mensajeError={mensajeError}
        enviando={enviando}
        alCambiar={cambiar}
        alEnviar={manejarEnvio}
        textoGuardar="Guardar cliente"
        textoGuardando="Guardando…"
        rutaCancelar="/clientes"
      />
    </section>
  )
}