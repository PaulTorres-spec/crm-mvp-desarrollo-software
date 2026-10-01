import { useEffect, useState } from 'react'

function App() {
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
    <div className="container py-5">
      <h1>CRM Textil El Amazonas</h1>
      <p>
        Estado del backend: <strong>{estado}</strong>
      </p>
    </div>
  )
}

export default App
