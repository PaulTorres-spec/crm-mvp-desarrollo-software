import { Link } from 'react-router'

import { TIPOS_CLIENTE, TIPOS_DOCUMENTO } from '../clientes/reglasCliente.js'
import { IconoAlerta, IconoCheck } from './Iconos.jsx'

const VALIDACIONES = [
  'Los campos con * son obligatorios.',
  'RUC: 11 dígitos y empieza en 10 o 20. DNI: 8 dígitos.',
  'No se permite registrar un documento que ya existe.',
  'El correo debe tener un formato válido.',
  'El teléfono acepta 7 a 9 dígitos.',
]

/**
 * Formulario de cliente compartido por Registrar (pantallas 05/06) y Editar (pantalla 07).
 * La página dueña guarda los datos y decide qué hacer al enviar; este componente solo dibuja.
 */
export default function FormularioCliente({
  datos,
  errores,
  mensajeError,
  enviando,
  alCambiar,
  alEnviar,
  documentoBloqueado = false,
  aviso,
  textoGuardar,
  textoGuardando,
  rutaCancelar,
}) {
  // Clase del input: agrega is-invalid (borde rojo + ícono) si el campo tiene error
  const clase = (campo, base = 'form-control') => (errores[campo] ? `${base} is-invalid` : base)

  return (
    <div className="row g-4 align-items-start">
      <div className="col-12 col-xl-8">
        <form className="card shadow-sm sel-form-tarjeta" onSubmit={alEnviar} noValidate>
          <div className="card-body p-4">
            {aviso}

            {mensajeError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 fw-medium" role="alert">
                <IconoAlerta />
                {mensajeError}
              </div>
            )}

            <h2 className="h5 mb-3">Identificación</h2>
            <div className="row g-3">
              <Campo id="tipoDocumento" etiqueta="Tipo de documento" obligatorio error={errores.tipoDocumento}>
                <select id="tipoDocumento" name="tipoDocumento" className={clase('tipoDocumento', 'form-select')}
                  value={datos.tipoDocumento} onChange={alCambiar} disabled={documentoBloqueado}>
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <option key={tipo.valor} value={tipo.valor}>{tipo.texto}</option>
                  ))}
                </select>
              </Campo>

              <Campo id="numeroDocumento" etiqueta="N.° de documento" obligatorio error={errores.numeroDocumento}
                ayuda={documentoBloqueado ? 'El documento no se puede modificar.' : 'RUC: 11 dígitos · DNI: 8 dígitos'}>
                <input id="numeroDocumento" name="numeroDocumento" inputMode="numeric"
                  className={clase('numeroDocumento')} value={datos.numeroDocumento} onChange={alCambiar}
                  disabled={documentoBloqueado} />
              </Campo>

              <Campo id="razonSocial" etiqueta="Razón social o nombre completo" obligatorio error={errores.razonSocial}>
                <input id="razonSocial" name="razonSocial" maxLength={150}
                  className={clase('razonSocial')} value={datos.razonSocial} onChange={alCambiar} />
              </Campo>

              <Campo id="tipoCliente" etiqueta="Tipo de cliente" obligatorio error={errores.tipoCliente}>
                <select id="tipoCliente" name="tipoCliente" className={clase('tipoCliente', 'form-select')}
                  value={datos.tipoCliente} onChange={alCambiar}>
                  <option value="">Selecciona…</option>
                  {TIPOS_CLIENTE.map((tipo) => (
                    <option key={tipo.valor} value={tipo.valor}>{tipo.texto}</option>
                  ))}
                </select>
              </Campo>
            </div>

            <hr className="my-4" />

            <h2 className="h5 mb-3">Contacto</h2>
            <div className="row g-3">
              <Campo id="personaContacto" etiqueta="Persona de contacto" error={errores.personaContacto}>
                <input id="personaContacto" name="personaContacto" maxLength={100}
                  className={clase('personaContacto')} value={datos.personaContacto} onChange={alCambiar} />
              </Campo>

              <Campo id="telefono" etiqueta="Teléfono" obligatorio error={errores.telefono}>
                <input id="telefono" name="telefono" type="tel" inputMode="numeric"
                  className={clase('telefono')} value={datos.telefono} onChange={alCambiar} />
              </Campo>

              <Campo id="correo" etiqueta="Correo electrónico" error={errores.correo}>
                <input id="correo" name="correo" type="email" maxLength={120}
                  className={clase('correo')} value={datos.correo} onChange={alCambiar} />
              </Campo>

              <Campo id="direccion" etiqueta="Dirección" error={errores.direccion}>
                <input id="direccion" name="direccion" maxLength={200}
                  className={clase('direccion')} value={datos.direccion} onChange={alCambiar} />
              </Campo>
            </div>

            <hr className="mt-4 mb-3" />

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <small className="text-secondary">* Campos obligatorios</small>
              <div className="d-flex gap-2">
                <Link to={rutaCancelar} className="btn btn-link text-secondary text-decoration-none">
                  Cancelar
                </Link>
                <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-2"
                  disabled={enviando}>
                  <IconoCheck />
                  {enviando ? textoGuardando : textoGuardar}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="col-12 col-xl-4">
        <aside className="sel-validaciones">
          <h2 className="h6 d-flex align-items-center gap-2 mb-3">
            <IconoAlerta />
            Validaciones del sistema
          </h2>
          <ul className="list-unstyled mb-0">
            {VALIDACIONES.map((texto) => (
              <li key={texto}>
                <IconoCheck />
                {texto}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}

/** Etiqueta + campo + mensaje de error (o texto de ayuda) en media fila. */
function Campo({ id, etiqueta, obligatorio = false, error, ayuda, children }) {
  return (
    <div className="col-12 col-md-6">
      <label htmlFor={id} className="form-label fw-medium">
        {etiqueta}
        {obligatorio && ' *'}
      </label>
      {children}
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {!error && ayuda && <div className="form-text">{ayuda}</div>}
    </div>
  )
}