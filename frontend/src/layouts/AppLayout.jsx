import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import isotipoNegativo from '../assets/logo/selvatica-isotipo-negativo.svg'
import isotipoColor from '../assets/logo/selvatica-isotipo-color.svg'
import MenuNavegacion from '../components/MenuNavegacion.jsx'
import { IconoCerrar, IconoMenu, IconoSalir } from '../components/Iconos.jsx'
import { useSesion } from '../sesion/useSesion.js' // ← 1. la sesión

// ← 2. Textos para mostrar el rol que llega de la API
const NOMBRE_ROL = {
  COMERCIAL: 'Comercial',
  GERENCIA: 'Gerencia',
  ADMIN: 'Administrador',
}

/** "María Quispe" → "MQ" (dos primeras palabras). */
function iniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('')
}

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
  const { usuario, cerrarSesion: terminarSesion } = useSesion()

  const cerrarMenu = () => setMenuAbierto(false)

  // ← 3. CU02 Cerrar sesión: borrar el token y volver al login
  const cerrarSesion = () => {
    cerrarMenu()
    terminarSesion()
    navigate('/login', { replace: true })
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

          {/* ← 4. Usuario real de la sesión (antes era "María Quispe" fijo) */}
          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="sel-avatar">{iniciales(usuario?.nombre)}</span>
            <div className="lh-sm d-none d-sm-block">
              <div className="fw-medium">{usuario?.nombre}</div>
              <small className="text-secondary">{NOMBRE_ROL[usuario?.rol] ?? usuario?.rol}</small>
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