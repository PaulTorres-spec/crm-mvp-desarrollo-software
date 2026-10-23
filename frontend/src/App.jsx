import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ClientesPage from './pages/ClientesPage.jsx'
import ClienteNuevoPage from './pages/ClienteNuevoPage.jsx'
import VentasPage from './pages/VentasPage.jsx'
import NoEncontradaPage from './pages/NoEncontradaPage.jsx'

import AppLayout from './layouts/AppLayout.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'

import RutaConPermiso from './components/RutaConPermiso.jsx'

import ClienteDetallePage from './pages/ClienteDetallePage.jsx'

import ClienteEditarPage from './pages/ClienteEditarPage.jsx'
import { puedeEditarClientes, puedeRegistrarClientes } from './sesion/permisos.js'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<RutaProtegida />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route
              path="/clientes/nuevo"
              element={
                <RutaConPermiso
                  permiso={puedeRegistrarClientes}
                  redirigirA="/clientes"
                  aviso="Tu rol no tiene permiso para registrar clientes."
                >
                  <ClienteNuevoPage />
                </RutaConPermiso>
              }
            />
            <Route path="/clientes/:id" element={<ClienteDetallePage />} />
            <Route
              path="/clientes/:id/editar"
              element={
                <RutaConPermiso
                  permiso={puedeEditarClientes}
                  redirigirA="/clientes"
                  aviso="Tu rol no tiene permiso para editar clientes."
                >
                  <ClienteEditarPage />
                </RutaConPermiso>
              }
            />
            <Route path="/ventas" element={<VentasPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NoEncontradaPage />} />
      </Routes>
    </BrowserRouter>
  )
}