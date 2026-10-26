import { useEffect, useState } from 'react'

import { pedir } from '../api/http.js'
import { IconoBillete, IconoCalendario, IconoClientes, IconoVentas } from '../components/Iconos.jsx'
import {
  formatearEntero,
  montoCorto,
  nombreMes,
  textoRango,
  textoVariacion,
} from '../dashboard/formatoDashboard.js'
import { PERIODO_INICIAL, PERIODOS, rangoDe, validarRango, variacion } from '../dashboard/periodos.js'
import { formatearSoles } from '../ventas/formatoVenta.js'
import { fechaDeHoy } from '../ventas/reglasVenta.js'

const NOMBRE_PLURAL = {
  CONFECCIONISTA: 'Confeccionistas',
  DISTRIBUIDOR: 'Distribuidores',
  INSTITUCIONAL: 'Institucionales',
}

/** CU12 + CU13 + CU14: indicadores comerciales por periodo (pantalla 02 del prototipo). */
export default function DashboardPage() {
  // Periodo aplicado: botón elegido (o 'rango') y sus fechas
  const [seleccion, setSeleccion] = useState(() => ({ clave: PERIODO_INICIAL, ...rangoDe(PERIODO_INICIAL) }))
  const [respuesta, setRespuesta] = useState({ consulta: null, datos: null, error: '' })

  // Rango personalizado (se abre con la caja del calendario)
  const [rangoAbierto, setRangoAbierto] = useState(false)
  const [formRango, setFormRango] = useState({ desde: '', hasta: '' })
  const [erroresRango, setErroresRango] = useState({})

  const consulta = new URLSearchParams({ desde: seleccion.desde, hasta: seleccion.hasta }).toString()

  useEffect(() => {
    let vigente = true
    pedir(`/dashboard?${consulta}`)
      .then((datos) => {
        if (vigente) setRespuesta({ consulta, datos, error: '' })
      })
      .catch((error) => {
        if (vigente) setRespuesta({ consulta, datos: null, error: error.message })
      })
    return () => {
      vigente = false
    }
  }, [consulta])

  const cargando = respuesta.consulta !== consulta
  const datos = respuesta.datos

  function elegirPeriodo(clave) {
    setSeleccion({ clave, ...rangoDe(clave) })
    setRangoAbierto(false)
  }

  function abrirRango() {
    setFormRango({ desde: seleccion.desde, hasta: seleccion.hasta })
    setErroresRango({})
    setRangoAbierto((abierto) => !abierto)
  }

  function cambiarRango(evento) {
    const { name, value } = evento.target
    setFormRango((anterior) => ({ ...anterior, [name]: value }))
    setErroresRango({})
  }

  function aplicarRango(evento) {
    evento.preventDefault()
    const errores = validarRango(formRango)
    if (Object.keys(errores).length > 0) {
      setErroresRango(errores)
      return
    }
    setSeleccion({ clave: 'rango', ...formRango })
    setRangoAbierto(false)
  }

  return (
    <section>
      <h1 className="h3 mb-3">Dashboard comercial</h1>

      {/* Filtro de periodo (CU14) */}
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <span className="fw-medium">Periodo</span>
        <div className="sel-periodo" role="group" aria-label="Periodo">
          {PERIODOS.map((periodo) => (
            <button
              key={periodo.clave}
              type="button"
              className={periodo.clave === seleccion.clave ? 'sel-periodo-opcion activo' : 'sel-periodo-opcion'}
              aria-pressed={periodo.clave === seleccion.clave}
              onClick={() => elegirPeriodo(periodo.clave)}
            >
              {periodo.texto}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={seleccion.clave === 'rango' ? 'sel-rango activo' : 'sel-rango'}
          aria-expanded={rangoAbierto}
          onClick={abrirRango}
          title="Elegir un rango de fechas"
        >
          <IconoCalendario />
          {textoRango(seleccion.desde, seleccion.hasta)}
        </button>
      </div>

      {rangoAbierto && (
        <form className="card sel-panel shadow-sm mb-3" onSubmit={aplicarRango} noValidate>
          <div className="card-body row g-3 align-items-start">
            <div className="col-6 col-lg-3">
              <label htmlFor="rango-desde" className="form-label fw-medium">Desde</label>
              <input id="rango-desde" name="desde" type="date"
                className={erroresRango.desde ? 'form-control is-invalid' : 'form-control'}
                value={formRango.desde} onChange={cambiarRango} />
              {erroresRango.desde && <div className="invalid-feedback">{erroresRango.desde}</div>}
            </div>
            <div className="col-6 col-lg-3">
              <label htmlFor="rango-hasta" className="form-label fw-medium">Hasta</label>
              <input id="rango-hasta" name="hasta" type="date"
                className={erroresRango.hasta ? 'form-control is-invalid' : 'form-control'}
                value={formRango.hasta} onChange={cambiarRango} />
              {erroresRango.hasta && <div className="invalid-feedback">{erroresRango.hasta}</div>}
            </div>
            <div className="col-12 col-lg-6 d-flex align-items-center gap-2 sel-filtros-acciones">
              <button type="submit" className="btn btn-primary">Aplicar</button>
              <button type="button" className="btn btn-link text-secondary text-decoration-none"
                onClick={() => setRangoAbierto(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      {respuesta.error && !cargando ? (
        <div className="alert alert-danger" role="alert">{respuesta.error}</div>
      ) : !datos ? (
        <p className="text-secondary">Cargando indicadores…</p>
      ) : (
        <div aria-busy={cargando} style={{ opacity: cargando ? 0.6 : 1 }}>
          {/* Indicadores (CU12, CU13) */}
          <div className="row g-3 mb-3">
            <TarjetaKpi
              titulo="N.° de clientes"
              icono={<IconoClientes />}
              valor={formatearEntero(datos.clientes.total)}
              nota={textoNuevos(datos.clientes.nuevosEnPeriodo)}
              tendencia={datos.clientes.nuevosEnPeriodo > 0 ? 1 : 0}
            />
            <TarjetaKpi
              titulo="N.° de ventas"
              icono={<IconoVentas />}
              valor={formatearEntero(datos.ventas.cantidad)}
              {...comparacion(datos.ventas.cantidad, datos.ventas.anterior.cantidad)}
            />
            <TarjetaKpi
              titulo="Monto total vendido"
              icono={<IconoBillete />}
              valor={formatearSoles(datos.ventas.montoTotal)}
              {...comparacion(datos.ventas.montoTotal, datos.ventas.anterior.montoTotal)}
            />
          </div>

          <div className="row g-3">
            <div className="col-12 col-lg-8">
              <VentasPorMes meses={datos.ventasPorMes} />
            </div>
            <div className="col-12 col-lg-4">
              <ClientesPorTipo clientes={datos.clientes} hasta={datos.hasta} />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/** "+12 nuevos en el periodo" / "+1 nuevo en el periodo" / "Sin clientes nuevos en el periodo". */
function textoNuevos(nuevos) {
  if (nuevos === 0) return 'Sin clientes nuevos en el periodo'
  return `+${formatearEntero(nuevos)} ${nuevos === 1 ? 'nuevo' : 'nuevos'} en el periodo`
}

/** Nota y color de una tarjeta comparada con el periodo anterior (props listas para TarjetaKpi). */
function comparacion(actual, anterior) {
  const valor = variacion(actual, anterior)
  if (valor === null) return { nota: 'Sin ventas en el periodo anterior', tendencia: 0 }
  return { nota: `${textoVariacion(valor)} frente al periodo anterior`, tendencia: Math.sign(valor) }
}

function TarjetaKpi({ titulo, icono, valor, nota, tendencia }) {
  const claseNota = tendencia > 0 ? 'sel-kpi-nota sube' : tendencia < 0 ? 'sel-kpi-nota baja' : 'sel-kpi-nota'
  return (
    <div className="col-12 col-md-4">
      <div className="card sel-panel shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <span className="sel-kpi-titulo">{titulo}</span>
            <span className="sel-kpi-icono">{icono}</span>
          </div>
          <div className="sel-kpi-valor mb-2">{valor}</div>
          <div className={claseNota}>{nota}</div>
        </div>
      </div>
    </div>
  )
}

/** Gráfico de barras con CSS: altura = monto / monto máximo × 100 %. El mes en curso va en rojo. */
function VentasPorMes({ meses }) {
  const maximo = Math.max(...meses.map((mes) => mes.montoTotal))
  const mesEnCurso = fechaDeHoy().slice(0, 7) // "2026-10-26" → "2026-10"

  return (
    <div className="card sel-panel shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-baseline mb-4">
          <h2 className="h5 mb-0">Monto vendido por mes (S/)</h2>
          <span className="sel-kpi-nota">Últimos 6 meses</span>
        </div>
        <div className="sel-barras">
          {meses.map((mes) => {
            const altura = maximo > 0 ? (mes.montoTotal / maximo) * 100 : 0
            const actual = mes.mes === mesEnCurso ? ' actual' : ''
            return (
              <div key={mes.mes} className="sel-barra-columna">
                <span className="sel-barra-valor">{montoCorto(mes.montoTotal)}</span>
                <div
                  className={`sel-barra${actual}`}
                  style={{ height: `${altura}%` }}
                  title={`${nombreMes(mes.mes)}: ${formatearSoles(mes.montoTotal)} en ${mes.cantidad} ventas`}
                  aria-label={`${nombreMes(mes.mes)}: ${formatearSoles(mes.montoTotal)}`}
                />
                <span className={`sel-barra-mes${actual}`}>{nombreMes(mes.mes)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Reparto de clientes por tipo (barras de progreso de Bootstrap). */
function ClientesPorTipo({ clientes, hasta }) {
  return (
    <div className="card sel-panel shadow-sm">
      <div className="card-body p-4">
        <h2 className="h5 mb-4">Clientes por tipo</h2>
        {clientes.porTipo.map((tipo) => {
          const ancho = clientes.total > 0 ? (tipo.cantidad / clientes.total) * 100 : 0
          return (
            <div key={tipo.tipoCliente} className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-medium">{NOMBRE_PLURAL[tipo.tipoCliente]}</span>
                <span className="fw-medium">{formatearEntero(tipo.cantidad)}</span>
              </div>
              <div className="progress sel-progreso" role="progressbar"
                aria-label={NOMBRE_PLURAL[tipo.tipoCliente]}
                aria-valuenow={tipo.cantidad} aria-valuemin={0} aria-valuemax={clientes.total}>
                <div className={`progress-bar sel-progreso-${tipo.tipoCliente}`} style={{ width: `${ancho}%` }} />
              </div>
            </div>
          )
        })}
        <p className="sel-kpi-nota mb-0 mt-3">
          Clientes registrados hasta el {textoRango(hasta, hasta).split(' – ')[0]}.
        </p>
      </div>
    </div>
  )
}