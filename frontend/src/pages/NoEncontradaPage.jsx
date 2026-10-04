import { Link } from 'react-router'

export default function NoEncontradaPage() {
  return (
    <main className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-2">
      <h1 className="h3">Página no encontrada</h1>
      <p className="text-secondary">La dirección que buscas no existe.</p>
      <Link to="/dashboard" className="btn btn-primary">Volver al inicio</Link>
    </main>
  )
}