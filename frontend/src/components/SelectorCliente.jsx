import { useEffect, useState } from 'react'

import { pedir } from '../api/http.js'
import { formatearDocumento } from '../clientes/formatoCliente.js'
import { IconoBuscar } from './Iconos.jsx'
import InsigniaTipoCliente from './InsigniaTipoCliente.jsx'

const MINIMO_LETRAS = 2

/**
 * CU09 Asociar venta a cliente: busca entre los clientes registrados (GET /api/clientes)
 * y deja elegir uno. No se puede escribir un cliente "a mano": solo elegirlo de la lista.
 */
export default function SelectorCliente({ cliente, alElegir, error }) {
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState({ texto: '', resultados: [], error: '' })

  const buscado = texto.trim()

  // Debounce + petición en un solo efecto: busca 300 ms después de la última tecla
  useEffect(() => {
    if (buscado.length < MINIMO_LETRAS) return
    let vigente = true
    const espera = setTimeout(() => {
      const parametros = new URLSearchParams({ texto: buscado, tamano: 5 })
      pedir(`/clientes?${parametros}`)
        .then((datos) => {
          if (vigente) setBusqueda({ texto: buscado, resultados: datos.contenido, error: '' })
        })
        .catch((fallo) => {
          if (vigente) setBusqueda({ texto: buscado, resultados: [], error: fallo.message })
        })
    }, 300)
    return () => {
      vigente = false
      clearTimeout(espera)
    }
  }, [buscado])

  // Ya hay un cliente elegido: se muestra y se puede cambiar
  if (cliente) {
    return (
      <div className="sel-cliente-elegido">
        <div>
          <div className="fw-medium">{cliente.razonSocial}</div>
          <small className="text-secondary">{formatearDocumento(cliente)}</small>
        </div>
        <InsigniaTipoCliente tipo={cliente.tipoCliente} />
        <button type="button" className="btn btn-link btn-sm ms-auto" onClick={() => alElegir(null)}>
          Cambiar
        </button>
      </div>
    )
  }

  const abierto = buscado.length >= MINIMO_LETRAS
  const listo = busqueda.texto === buscado // la respuesta corresponde a lo que está escrito ahora

  function elegir(opcion) {
    setTexto('')
    alElegir(opcion)
  }

  return (
    <div>
      <div className="sel-selector">
        <div className="sel-buscador">
          <IconoBuscar />
          <input
            id="cliente"
            type="search"
            className={error ? 'form-control is-invalid' : 'form-control'}
            placeholder="Escribe el nombre, RUC o DNI…"
            autoComplete="off"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>

        {abierto && (
          <div className="list-group sel-selector-resultados">
            {!listo && <div className="list-group-item text-secondary">Buscando…</div>}
            {listo && busqueda.error && <div className="list-group-item text-danger">{busqueda.error}</div>}
            {listo && !busqueda.error && busqueda.resultados.length === 0 && (
              <div className="list-group-item text-secondary">No hay clientes registrados con «{buscado}».</div>
            )}
            {listo &&
              busqueda.resultados.map((opcion) => (
                <button
                  key={opcion.id}
                  type="button"
                  className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                  onClick={() => elegir(opcion)}
                >
                  <span className="flex-grow-1">
                    <span className="d-block fw-medium">{opcion.razonSocial}</span>
                    <small className="text-secondary">{formatearDocumento(opcion)}</small>
                  </span>
                  <InsigniaTipoCliente tipo={opcion.tipoCliente} />
                </button>
              ))}
          </div>
        )}
      </div>

      {error ? (
        <div className="invalid-feedback d-block">{error}</div>
      ) : (
        <div className="form-text">Busca por nombre, RUC o DNI. Solo clientes registrados.</div>
      )}
    </div>
  )
}