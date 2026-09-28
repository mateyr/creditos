// Los enums viajan como texto (JsonStringEnumConverter en el backend).
export const ESTADOS_SOLICITUD = [
  "Pendiente",
  "Aprobada",
  "Rechazada",
  "Desembolsada",
] as const
export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number]

export const PERIODICIDADES = ["Quincenal", "Mensual", "Anual"] as const
export type Periodicidad = (typeof PERIODICIDADES)[number]

export const TIPOS_EMPLEO = ["Asalariado", "Independiente"] as const
export type TipoEmpleo = (typeof TIPOS_EMPLEO)[number]

/** Periodos por año (n) de la fórmula de la cuota nivelada. */
export const PERIODOS_POR_ANIO: Record<Periodicidad, number> = {
  Anual: 1,
  Mensual: 12,
  Quincenal: 24,
}

/** Nombre de la periodicidad en plural para frases como "12 cuotas mensuales". */
export const PERIODICIDAD_PLURAL: Record<Periodicidad, string> = {
  Anual: "anuales",
  Mensual: "mensuales",
  Quincenal: "quincenales",
}

export type SolicitudResumen = {
  id: number
  cedula: string
  nombreCompleto: string
  edad: number
  montoSolicitado: number
  cantidadCuotas: number
  periodicidad: Periodicidad
  plazoMeses: number
  estado: EstadoSolicitud
  fechaCreacion: string
}

export type SolicitudDetalle = {
  id: number
  clienteId: number
  cedula: string
  nombreCompleto: string
  edad: number
  tipoEmpleo: TipoEmpleo
  lugarTrabajo: string
  antiguedadLaboral: number
  ingresoMensual: number
  montoSolicitado: number
  cantidadCuotas: number
  tasaInteresAnual: number
  periodicidad: Periodicidad
  plazoMeses: number
  cuotaNivelada: number
  estado: EstadoSolicitud
  observaciones: string | null
  fechaCreacion: string
  fechaDictamen: string | null
  numeroCredito: string | null
}

export type CuotaPlanPago = {
  numeroCuota: number
  /** Fecha en formato ISO (YYYY-MM-DD). */
  fechaVencimiento: string
  cuota: number
  capital: number
  interes: number
  saldo: number
}

export type PlanPagos = {
  numeroCredito: string
  fechaCreacion: string
  totalCapital: number
  totalIntereses: number
  totalPagar: number
  cuotas: CuotaPlanPago[]
}

export type SolicitudesParams = {
  page: number
  pageSize: number
  search?: string
  estado?: EstadoSolicitud
}
