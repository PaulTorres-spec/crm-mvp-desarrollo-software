import { useContext } from 'react'

import { SesionContexto } from './sesionContexto.js'

/** Devuelve { usuario, cargando, iniciarSesion, cerrarSesion }. */
export function useSesion() {
  const sesion = useContext(SesionContexto)
  if (!sesion) {
    throw new Error('useSesion debe usarse dentro de <SesionProvider>.')
  }
  return sesion
}