const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function IconoDashboard() {
  return (
    <svg {...base}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

export function IconoClientes() {
  return (
    <svg {...base}>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21v-1a6 6 0 0 1 12 0v1" />
      <path d="M16 4.5a4 4 0 0 1 0 7" />
      <path d="M22 21v-1a6 6 0 0 0-4-5.6" />
    </svg>
  )
}

export function IconoVentas() {
  return (
    <svg {...base}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

export function IconoSalir() {
  return (
    <svg {...base}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

export function IconoMenu() {
  return (
    <svg {...base}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

export function IconoCerrar() {
  return (
    <svg {...base}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function IconoCandado() {
  return (
    <svg {...base} width={18} height={18}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

export function IconoAgregar() {
  return (
    <svg {...base} width={18} height={18}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

export function IconoVolver() {
  return (
    <svg {...base} width={16} height={16}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export function IconoCheck() {
  return (
    <svg {...base} width={16} height={16}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function IconoAlerta() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}


export function IconoSiguiente() {
  return (
    <svg {...base} width={16} height={16}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function IconoBuscar() {
  return (
    <svg {...base} width={18} height={18}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function IconoVer() {
  return (
    <svg {...base} width={18} height={18}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconoEditar() {
  return (
    <svg {...base} width={18} height={18}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

export function IconoEliminar() {
  return (
    <svg {...base}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function IconoCalendario() {
  return (
    <svg {...base} width={18} height={18}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

export function IconoBillete() {
  return (
    <svg {...base}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}