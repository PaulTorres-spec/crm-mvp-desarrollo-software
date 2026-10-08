import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { pedir } from '../api/http.js'
import {
  CLIENTE_VACIO,
  TIPOS_CLIENTE,
  TIPOS_DOCUMENTO,
  prepararCliente,
  validarCliente,
} from '../clientes/reglasCliente.js'
import { IconoAlerta, IconoCheck, IconoVolver } from '../components/Iconos.jsx'

const VALIDACIONES = [
  'Los campos con * son obligatorios.',
  'RUC: 11 dígitos y empieza en 10 o 20. DNI: 8 dígitos.',
  'No se permite registrar un documento que ya existe.',
  'El correo debe tener un formato válido.',
  'El teléfono acepta 7 a 9 dígitos.',
]

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

  // Clase del input: agrega is-invalid (borde rojo + ícono) si el campo tiene error
  const clase = (campo, base = 'form-control') => (errores[campo] ? `${base} is-invalid` : base)

  return (
    <section>
      <Link to="/clientes" className="sel-volver mb-3">
        <IconoVolver />
        Volver a clientes
      </Link>
      <h1 className="h3 mb-4">Registrar cliente</h1>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-xl-8">
          <form className="card shadow-sm sel-form-tarjeta" onSubmit={manejarEnvio} noValidate>
            <div className="card-body p-4">
              {mensajeError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 fw-medium" role="alert">
                  <IconoAlerta />
                  {mensajeError}
                </div>
              )}

              <h2 className="h5 mb-3">Identificación</h2>
              <div className="row g-3">
                <Campo id="tipoDocumento" etiqueta="Tipo de documento" obligatorio error={errores.tipoDocumento}>
                  <select id="tipoDocumento" name="tipoDocumento" className={clase('tipoDocumento', 'form-select')}
                    value={datos.tipoDocumento} onChange={cambiar}>
                    {TIPOS_DOCUMENTO.map((tipo) => (
                      <option key={tipo.valor} value={tipo.valor}>{tipo.texto}</option>
                    ))}
                  </select>
                </Campo>

                <Campo id="numeroDocumento" etiqueta="N.° de documento" obligatorio error={errores.numeroDocumento}
                  ayuda="RUC: 11 dígitos · DNI: 8 dígitos">
                  <input id="numeroDocumento" name="numeroDocumento" inputMode="numeric"
                    className={clase('numeroDocumento')} value={datos.numeroDocumento} onChange={cambiar} />
                </Campo>

                <Campo id="razonSocial" etiqueta="Razón social o nombre completo" obligatorio error={errores.razonSocial}>
                  <input id="razonSocial" name="razonSocial" maxLength={150}
                    className={clase('razonSocial')} value={datos.razonSocial} onChange={cambiar} />
                </Campo>

                <Campo id="tipoCliente" etiqueta="Tipo de cliente" obligatorio error={errores.tipoCliente}>
                  <select id="tipoCliente" name="tipoCliente" className={clase('tipoCliente', 'form-select')}
                    value={datos.tipoCliente} onChange={cambiar}>
                    <option value="">Selecciona…</option>
                    {TIPOS_CLIENTE.map((tipo) => (
                      <option key={tipo.valor} value={tipo.valor}>{tipo.texto}</option>
                    ))}
                  </select>
                </Campo>
              </div>

              <hr className="my-4" />

              <h2 className="h5 mb-3">Contacto</h2>
              <div className="row g-3">
                <Campo id="personaContacto" etiqueta="Persona de contacto" error={errores.personaContacto}>
                  <input id="personaContacto" name="personaContacto" maxLength={100}
                    className={clase('personaContacto')} value={datos.personaContacto} onChange={cambiar} />
                </Campo>

                <Campo id="telefono" etiqueta="Teléfono" obligatorio error={errores.telefono}>
                  <input id="telefono" name="telefono" type="tel" inputMode="numeric"
                    className={clase('telefono')} value={datos.telefono} onChange={cambiar} />
                </Campo>

                <Campo id="correo" etiqueta="Correo electrónico" error={errores.correo}>
                  <input id="correo" name="correo" type="email" maxLength={120}
                    className={clase('correo')} value={datos.correo} onChange={cambiar} />
                </Campo>

                <Campo id="direccion" etiqueta="Dirección" error={errores.direccion}>
                  <input id="direccion" name="direccion" maxLength={200}
                    className={clase('direccion')} value={datos.direccion} onChange={cambiar} />
                </Campo>
              </div>

              <hr className="mt-4 mb-3" />

              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <small className="text-secondary">* Campos obligatorios</small>
                <div className="d-flex gap-2">
                  <Link to="/clientes" className="btn btn-link text-secondary text-decoration-none">
                    Cancelar
                  </Link>
                  <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-2"
                    disabled={enviando}>
                    <IconoCheck />
                    {enviando ? 'Guardando…' : 'Guardar cliente'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="col-12 col-xl-4">
          <aside className="sel-validaciones">
            <h2 className="h6 d-flex align-items-center gap-2 mb-3">
              <IconoAlerta />
              Validaciones del sistema
            </h2>
            <ul className="list-unstyled mb-0">
              {VALIDACIONES.map((texto) => (
                <li key={texto}>
                  <IconoCheck />
                  {texto}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}

/** Etiqueta + campo + mensaje de error (o texto de ayuda) en media fila. */
function Campo({ id, etiqueta, obligatorio = false, error, ayuda, children }) {
  return (
    <div className="col-12 col-md-6">
      <label htmlFor={id} className="form-label fw-medium">
        {etiqueta}
        {obligatorio && ' *'}
      </label>
      {children}
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {!error && ayuda && <div className="form-text">{ayuda}</div>}
    </div>
  )
}