import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'

import logoCompleto from '../assets/logo/selvatica-completo-negativo.svg'
import isotipoColor from '../assets/logo/selvatica-isotipo-color.svg'
import { useSesion } from '../sesion/useSesion.js'
import { IconoCandado } from '../components/Iconos.jsx'

/** CU01 Iniciar sesión (pantalla 01 Login del prototipo). */
export default function LoginPage() {
  const { usuario, iniciarSesion } = useSesion()
  const location = useLocation()
  // Si una ruta protegida nos mandó aquí, volvemos a ella después del login
  const destino = location.state?.desde ?? '/dashboard'

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [erroresCampo, setErroresCampo] = useState({})
  const [mensajeError, setMensajeError] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Ya hay sesión: no tiene sentido mostrar el login
  if (usuario) {
    return <Navigate to={destino} replace />
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()

    // Validamos en el navegador con las mismas reglas del backend, para avisar antes de enviar
    const errores = {}
    if (!correo.trim()) {
      errores.correo = 'Ingresa tu correo.'
    } else if (!/^\S+@\S+\.\S+$/.test(correo.trim())) {
      errores.correo = 'Ingresa un correo válido, por ejemplo nombre@empresa.com.'
    }
    if (!contrasena) {
      errores.contrasena = 'Ingresa tu contraseña.'
    }
    setErroresCampo(errores)
    setMensajeError('')
    if (Object.keys(errores).length > 0) return

    setEnviando(true)
    try {
      await iniciarSesion(correo, contrasena)
      // Al guardarse el usuario, este componente se vuelve a dibujar y el <Navigate> nos lleva al destino
    } catch (error) {
      if (error.estado === 400) {
        // 400 VALIDACION: un mensaje debajo de cada campo
        setErroresCampo(Object.fromEntries(error.errores.map((e) => [e.campo, e.mensaje])))
      } else {
        // 401 "Correo o contraseña incorrectos." o servidor apagado
        setMensajeError(error.message)
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex">
      {/* Panel de marca: solo en pantallas grandes (992 px o más) */}
      <section className="sel-login-marca d-none d-lg-flex">
        <img src={logoCompleto} alt="SELVATICA" width="300" />
        <div>
          <h1 className="sel-login-titulo">Gestión comercial de nuestros clientes, en un solo lugar.</h1>
          <p className="mb-0">
            Registra confeccionistas, distribuidores y cuentas institucionales, sus ventas y los
            indicadores del área comercial.
          </p>
          <span className="sel-login-linea" />
        </div>
        <small className="opacity-75">© 2026 Textil El Amazonas S.A. BIC</small>
      </section>

      {/* Formulario */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center p-3">
        <div className="card shadow-sm sel-login-tarjeta">
          <div className="card-body p-4 p-sm-5">
            <img src={isotipoColor} alt="" width="44" height="44" className="mb-3" />
            <h2 className="h4 fw-semibold mb-1">Iniciar sesión</h2>
            <p className="text-secondary mb-4">Ingresa con tu correo corporativo.</p>

            {mensajeError && (
              <div className="alert alert-danger py-2" role="alert">
                {mensajeError}
              </div>
            )}

            <form onSubmit={manejarEnvio} noValidate>
              <div className="mb-3">
                <label htmlFor="correo" className="form-label fw-medium">Correo</label>
                <input
                  id="correo"
                  type="email"
                  autoComplete="username"
                  placeholder="nombre@amazonas.com.pe"
                  className={`form-control ${erroresCampo.correo ? 'is-invalid' : ''}`}
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
                {erroresCampo.correo && <div className="invalid-feedback">{erroresCampo.correo}</div>}
              </div>

              <div className="mb-4">
                <label htmlFor="contrasena" className="form-label fw-medium">Contraseña</label>
                <input
                  id="contrasena"
                  type="password"
                  autoComplete="current-password"
                  className={`form-control ${erroresCampo.contrasena ? 'is-invalid' : ''}`}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
                {erroresCampo.contrasena && <div className="invalid-feedback">{erroresCampo.contrasena}</div>}
              </div>

              <button
               type="submit"
                className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2"
                disabled={enviando}
              >
                <IconoCandado />
                {enviando ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>

            <p className="small text-secondary mt-4 mb-0">
              ¿Olvidaste tu contraseña? Comunícate con el administrador del sistema.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}