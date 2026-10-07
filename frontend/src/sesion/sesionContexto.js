import { createContext } from 'react'

/** Canal de la sesión: { usuario, cargando, iniciarSesion, cerrarSesion }. */
export const SesionContexto = createContext(null)