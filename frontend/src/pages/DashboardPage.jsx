import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [estado, setEstado] = useState('Consultando...')

  useEffect(() => {
    fetch('/api/health')
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status)
        return respuesta.json()
      })
      .then((datos) => setEstado(datos.status))
      .catch(() => setEstado('Sin conexión con el backend'))
  }, [])

  return (
    <section>
      <h1 className="h3">Dashboard comercial</h1>
      <p className="text-secondary">Indicadores del periodo (se construye en el módulo M4).</p>
      <p>
        Estado del backend: <strong>{estado}</strong>
      </p>
    </section>
  )
}