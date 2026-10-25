import { Link, useLocation } from 'react-router'

import { IconoAgregar } from '../components/Iconos.jsx'
import { puedeRegistrarVentas } from '../sesion/permisos.js'
import { useSesion } from '../sesion/useSesion.js'

/** Ventas: por ahora, acceso al registro (CU08). La consulta con filtros (pantalla 08) llega en M3-5. */
export default function VentasPage() {
  const { usuario } = useSesion()
  const location = useLocation()
  const exito = location.state?.exito
  const aviso = location.state?.aviso

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h3 mb-0">Ventas</h1>
        {puedeRegistrarVentas(usuario) && (
          <Link to="/ventas/nueva" className="btn btn-primary d-inline-flex align-items-center gap-2">
            <IconoAgregar />
            Registrar venta
          </Link>
        )}
      </div>

      {exito && <div className="alert alert-success" role="status">{exito}</div>}
      {aviso && <div className="alert alert-warning" role="alert">{aviso}</div>}

      <p className="text-secondary">La consulta y los filtros de ventas se construyen en M3-5.</p>
    </section>
  )
}