import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { pedir } from '../api/http.js'
import { CLIENTE_VACIO, prepararCliente, validarCliente } from '../clientes/reglasCliente.js'
import { useFormularioCliente } from '../clientes/useFormularioCliente.js'
import FormularioCliente from '../components/FormularioCliente.jsx'
import { IconoVolver } from '../components/Iconos.jsx'

/** CU03 Registrar cliente + CU04 Validar datos (pantallas 05 y 06 del prototipo). */
export default function ClienteNuevoPage() {
  const navigate = useNavigate()
  const formulario = useFormularioCliente(CLIENTE_VACIO)
  const [enviando, setEnviando] = useState(false)

  async function manejarEnvio(evento) {
    evento.preventDefault()

    // 1. Reglas del CU04 en el navegador: si algo falla, no molestamos al servidor
    if (formulario.mostrarErrores(validarCliente(formulario.datos))) return

    // 2. Enviamos al backend, que vuelve a validar y revisa duplicados
    setEnviando(true)
    try {
      const cliente = await pedir('/clientes', { metodo: 'POST', cuerpo: prepararCliente(formulario.datos) })
      navigate('/clientes', {
        state: { exito: `Cliente "${cliente.razonSocial}" registrado correctamente.` },
      })
    } catch (error) {
      if (error.estado === 400 || error.estado === 409) {
        // 400 VALIDACION o 409 DUPLICADO: el backend dice qué campo falló
        formulario.mostrarErrores(Object.fromEntries(error.errores.map((e) => [e.campo, e.mensaje])))
      } else {
        // 403 sin permiso, servidor apagado, etc.
        formulario.mostrarFallo(error.message)
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
        datos={formulario.datos}
        errores={formulario.errores}
        mensajeError={formulario.mensajeError}
        enviando={enviando}
        alCambiar={formulario.cambiar}
        alEnviar={manejarEnvio}
        textoGuardar="Guardar cliente"
        textoGuardando="Guardando…"
        rutaCancelar="/clientes"
      />
    </section>
  )
}