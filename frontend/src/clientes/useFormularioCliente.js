import { useState } from 'react'

/**
 * Estado y reacciones del formulario de cliente, compartidos por Registrar y Editar.
 * Un "hook propio": una función que usa otros hooks (useState) y se reutiliza en varias páginas.
 */
export function useFormularioCliente(inicial) {
  const [datos, setDatos] = useState(inicial)
  const [errores, setErrores] = useState({})
  const [mensajeError, setMensajeError] = useState('')

  // Un solo manejador para todos los campos: usa el atributo name del input
  function cambiar(evento) {
    const { name, value } = evento.target
    setDatos((anteriores) => ({ ...anteriores, [name]: value }))
    // El usuario está corrigiendo ese campo: quitamos su mensaje de error
    setErrores((anteriores) => ({ ...anteriores, [name]: null }))
  }

  // Guarda los errores por campo y arma la alerta superior. Devuelve true si hay errores.
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

  // Error general sin campo concreto (servidor apagado, sin permiso, etc.)
  function mostrarFallo(mensaje) {
    setErrores({})
    setMensajeError(mensaje)
  }

  return { datos, setDatos, errores, mensajeError, cambiar, mostrarErrores, mostrarFallo }
}