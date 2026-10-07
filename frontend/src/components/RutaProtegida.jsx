import { Navigate, Outlet, useLocation } from 'react-router'

import { useSesion } from '../sesion/useSesion.js'

/** Deja pasar solo si hay sesión; si no, manda al login recordando a dónde se quería ir. */
export default function RutaProtegida() {
  const { usuario, cargando } = useSesion()
  const location = useLocation()

  // Hay un token guardado y estamos preguntando a /yo quién es: esperamos sin decidir todavía
  if (cargando) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  return <Outlet />
}