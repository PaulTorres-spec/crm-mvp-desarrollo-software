import { NavLink } from 'react-router'
import { IconoClientes, IconoDashboard, IconoVentas } from './Iconos.jsx'

const opciones = [
  { ruta: '/dashboard', texto: 'Dashboard', Icono: IconoDashboard },
  { ruta: '/clientes', texto: 'Clientes', Icono: IconoClientes },
  { ruta: '/ventas', texto: 'Ventas', Icono: IconoVentas },
]

export default function MenuNavegacion({ alNavegar }) {
  return (
    <nav className="d-flex flex-column gap-1">
      {opciones.map(({ ruta, texto, Icono }) => (
        <NavLink key={ruta} to={ruta} className="sel-nav-link" onClick={alNavegar}>
          <Icono />
          <span>{texto}</span>
        </NavLink>
      ))}
    </nav>
  )
}