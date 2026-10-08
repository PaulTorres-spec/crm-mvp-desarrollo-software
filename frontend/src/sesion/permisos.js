// Reglas de acceso en la interfaz. Deben coincidir con los @PreAuthorize del backend.

/** CU03: igual que ClienteControlador → hasAnyRole('COMERCIAL', 'ADMIN'). */
const ROLES_QUE_REGISTRAN_CLIENTES = ['COMERCIAL', 'ADMIN']

export function puedeRegistrarClientes(usuario) {
  return ROLES_QUE_REGISTRAN_CLIENTES.includes(usuario?.rol)
}