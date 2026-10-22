import { nombreTipoCliente } from '../clientes/formatoCliente.js'

/** Etiqueta de color del tipo de cliente (pantallas 03 y 04). */
export default function InsigniaTipoCliente({ tipo }) {
  return <span className={`sel-insignia sel-insignia-${tipo.toLowerCase()}`}>{nombreTipoCliente(tipo)}</span>
}