import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import isotipoNegativo from '../assets/logo/selvatica-isotipo-negativo.svg'
import isotipoColor from '../assets/logo/selvatica-isotipo-color.svg'
import MenuNavegacion from '../components/MenuNavegacion.jsx'
import { IconoCerrar, IconoMenu, IconoSalir } from '../components/Iconos.jsx'

function Marca() {
  return (
    <div className="d-flex align-items-center gap-2">
      <img src={isotipoNegativo} alt="" width="32" height="32" />
      <span className="sel-marca-texto">CRM Amazonas</span>
    </div>
  )
}

function ContenidoMenu({ alNavegar, alCerrarSesion }) {
  return (
    <>
      <p className="sel-menu-titulo">Menú</p>
      <MenuNavegacion alNavegar={alNavegar} />
      <button type="button" className="sel-nav-link mt-auto" onClick={alCerrarSesion}>
        <IconoSalir />
        <span>Cerrar sesión</span>
      </button>
    </>
  )
}

export default function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const navigate = useNavigate()

  const cerrarMenu = () => setMenuAbierto(false)

  // CU02: en el paso 6 aquí también se borrará el token
  const cerrarSesion = () => {
    cerrarMenu()
    navigate('/login')
  }

  return (
    <div className="d-flex min-vh-100">
      {/* Barra lateral fija: solo en pantallas grandes (992 px o más) */}
      <aside className="sel-sidebar d-none d-lg-flex">
        <Marca />
        <ContenidoMenu alCerrarSesion={cerrarSesion} />
      </aside>

      {/* Menú desplegable para celular y tablet (offcanvas) */}
      {menuAbierto && <div className="offcanvas-backdrop fade show d-lg-none" onClick={cerrarMenu} />}
      <aside className={`sel-sidebar sel-offcanvas d-lg-none ${menuAbierto ? 'abierto' : ''}`}>
        <div className="d-flex align-items-center justify-content-between">
          <Marca />
          <button type="button" className="btn btn-link text-white p-1" onClick={cerrarMenu} aria-label="Cerrar menú">
            <IconoCerrar />
          </button>
        </div>
        <ContenidoMenu alNavegar={cerrarMenu} alCerrarSesion={cerrarSesion} />
      </aside>

      {/* Zona derecha: barra superior + página actual */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <header className="sel-topbar">
          <button type="button" className="btn btn-link text-body p-1 d-lg-none" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">
            <IconoMenu />
          </button>
          <img src={isotipoColor} alt="" width="28" height="28" className="d-lg-none" />
          <span className="sel-marca-texto text-body d-lg-none">CRM Amazonas</span>

          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="sel-avatar">MQ</span>
            <div className="lh-sm d-none d-sm-block">
              <div className="fw-medium">María Quispe</div>
              <small className="text-secondary">Comercial</small>
            </div>
          </div>
        </header>

        <main className="flex-grow-1 p-3 p-lg-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}