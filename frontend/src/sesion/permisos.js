// Reglas de acceso en la interfaz. Deben coincidir con los @PreAuthorize del backend.

/** CU03: igual que ClienteControlador → hasAnyRole('COMERCIAL', 'ADMIN'). */
const ROLES_QUE_REGISTRAN_CLIENTES = ['COMERCIAL', 'ADMIN']

export function puedeRegistrarClientes(usuario) {
  return ROLES_QUE_REGISTRAN_CLIENTES.includes(usuario?.rol)
}

/** CU07: igual que el PUT de ClienteControlador → hasAnyRole('COMERCIAL', 'ADMIN'). */
const ROLES_QUE_EDITAN_CLIENTES = ['COMERCIAL', 'ADMIN']

export function puedeEditarClientes(usuario) {
  return ROLES_QUE_EDITAN_CLIENTES.includes(usuario?.rol)
}