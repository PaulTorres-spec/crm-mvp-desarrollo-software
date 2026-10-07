import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ClientesPage from './pages/ClientesPage.jsx'
import ClienteNuevoPage from './pages/ClienteNuevoPage.jsx'
import VentasPage from './pages/VentasPage.jsx'
import NoEncontradaPage from './pages/NoEncontradaPage.jsx'

import AppLayout from './layouts/AppLayout.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'

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
            <Route path="/clientes/nuevo" element={<ClienteNuevoPage />} />
            <Route path="/ventas" element={<VentasPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NoEncontradaPage />} />
      </Routes>
    </BrowserRouter>
  )
}