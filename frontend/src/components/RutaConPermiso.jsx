import { Navigate } from 'react-router'

import { useSesion } from '../sesion/useSesion.js'

/** Muestra la página solo si el usuario cumple el permiso; si no, redirige con un aviso. */
export default function RutaConPermiso({ permiso, redirigirA = '/dashboard', aviso, children }) {
  const { usuario } = useSesion()

  if (!permiso(usuario)) {
    return <Navigate to={redirigirA} replace state={{ aviso }} />
  }

  return children
}