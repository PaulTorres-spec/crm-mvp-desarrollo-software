import { Link, useLocation } from 'react-router'

import { IconoAgregar } from '../components/Iconos.jsx'
import { puedeRegistrarClientes } from '../sesion/permisos.js'
import { useSesion } from '../sesion/useSesion.js'

/** Clientes. La lista y la búsqueda (CU05) llegan en M2; por ahora, acceso a Registrar cliente (CU03). */
export default function ClientesPage() {
  const { usuario } = useSesion()
  const location = useLocation()
  // Mensajes que pueden llegar desde otra página (registro exitoso o sin permiso)
  const exito = location.state?.exito
  const aviso = location.state?.aviso

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h3 mb-0">Clientes</h1>
        {puedeRegistrarClientes(usuario) && (
          <Link to="/clientes/nuevo" className="btn btn-primary d-inline-flex align-items-center gap-2">
            <IconoAgregar />
            Registrar cliente
          </Link>
        )}
      </div>

      {exito && <div className="alert alert-success" role="status">{exito}</div>}
      {aviso && <div className="alert alert-warning" role="alert">{aviso}</div>}

      <p className="text-secondary">La lista y la búsqueda de clientes se construyen en el módulo M2 (CU05).</p>
    </section>
  )
}