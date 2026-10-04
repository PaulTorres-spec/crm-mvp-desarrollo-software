import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ClientesPage from './pages/ClientesPage.jsx'
import ClienteNuevoPage from './pages/ClienteNuevoPage.jsx'
import VentasPage from './pages/VentasPage.jsx'
import NoEncontradaPage from './pages/NoEncontradaPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/clientes/nuevo" element={<ClienteNuevoPage />} />
        <Route path="/ventas" element={<VentasPage />} />
        <Route path="*" element={<NoEncontradaPage />} />
      </Routes>
    </BrowserRouter>
  )
}