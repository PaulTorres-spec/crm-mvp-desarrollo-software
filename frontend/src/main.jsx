import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Fuentes (Fira Sans para la interfaz, Montserrat para la marca)
import '@fontsource/fira-sans/400.css'
import '@fontsource/fira-sans/500.css'
import '@fontsource/fira-sans/600.css'
import '@fontsource/montserrat/700.css'

// Bootstrap primero y luego nuestro tema, para que el tema gane
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/tema.css'

import App from './App.jsx'
import SesionProvider from './sesion/SesionProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SesionProvider>
      <App />
    </SesionProvider>
  </StrictMode>,
)
