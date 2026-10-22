import { IconoSiguiente, IconoVolver } from './Iconos.jsx'

/**
 * Números de página a mostrar (empiezan en 0). Con muchas páginas resume con "…":
 * actual 5 de 31 → [0, '…', 4, 5, 6, '…', 30]
 */
function paginasVisibles(actual, total) {
  if (total <= 7) return [...Array(total).keys()]
  const cercanas = [actual - 1, actual, actual + 1].filter((p) => p > 0 && p < total - 1)
  const lista = [0]
  if (cercanas[0] > 1) lista.push('…')
  lista.push(...cercanas)
  if (cercanas[cercanas.length - 1] < total - 2) lista.push('…')
  lista.push(total - 1)
  return lista
}

/** Botones ‹ 1 2 3 … 31 › (el usuario ve la página + 1). */
export default function Paginacion({ pagina, totalPaginas, alCambiar }) {
  if (totalPaginas <= 1) return null

  return (
    <nav aria-label="Paginación" className="d-flex align-items-center gap-1">
      <button type="button" className="sel-pagina" disabled={pagina === 0}
        onClick={() => alCambiar(pagina - 1)} aria-label="Página anterior">
        <IconoVolver />
      </button>
      {paginasVisibles(pagina, totalPaginas).map((p, indice) =>
        p === '…' ? (
          <span key={`puntos-${indice}`} className="px-1 text-secondary">…</span>
        ) : (
          <button key={p} type="button" className={`sel-pagina ${p === pagina ? 'activa' : ''}`}
            onClick={() => alCambiar(p)} aria-current={p === pagina ? 'page' : undefined}>
            {p + 1}
          </button>
        ),
      )}
      <button type="button" className="sel-pagina" disabled={pagina >= totalPaginas - 1}
        onClick={() => alCambiar(pagina + 1)} aria-label="Página siguiente">
        <IconoSiguiente />
      </button>
    </nav>
  )
}