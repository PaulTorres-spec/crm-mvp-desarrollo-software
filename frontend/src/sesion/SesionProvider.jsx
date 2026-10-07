import { useCallback, useEffect, useMemo, useState } from 'react'

import { borrarToken, cuandoExpireLaSesion, guardarToken, obtenerToken, pedir } from '../api/http.js'
import { SesionContexto } from './sesionContexto.js'

/** Guarda quién inició sesión y lo comparte con toda la app (CU01 y CU02). */
export default function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  // Si hay un token guardado, empezamos "cargando" mientras preguntamos a /yo quién es
  const [cargando, setCargando] = useState(() => obtenerToken() !== null)

  /** CU02 Cerrar sesión: borrar el token y olvidar al usuario. */
  const cerrarSesion = useCallback(() => {
    borrarToken()
    setUsuario(null)
  }, [])

  // Si el backend responde 401 con un token vencido, el módulo http nos avisa
  useEffect(() => {
    cuandoExpireLaSesion(cerrarSesion)
  }, [cerrarSesion])

  // Al abrir o recargar la página: si hay token, recuperamos el usuario con GET /api/auth/yo
  useEffect(() => {
    if (!obtenerToken()) return
    pedir('/auth/yo')
      .then((datos) => setUsuario(datos))
      .catch(() => cerrarSesion())
      .finally(() => setCargando(false))
  }, [cerrarSesion])

  /** CU01 Iniciar sesión: llama a la API, guarda el token y el usuario. */
  const iniciarSesion = useCallback(async (correo, contrasena) => {
    const respuesta = await pedir('/auth/login', {
      metodo: 'POST',
      cuerpo: { correo, contrasena },
    })
    guardarToken(respuesta.token)
    setUsuario(respuesta.usuario)
    return respuesta.usuario
  }, [])

  const valor = useMemo(
    () => ({ usuario, cargando, iniciarSesion, cerrarSesion }),
    [usuario, cargando, iniciarSesion, cerrarSesion],
  )

  return <SesionContexto value={valor}>{children}</SesionContexto>
}