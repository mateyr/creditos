import type {
  EstadoSolicitud,
  Periodicidad,
} from "@/features/solicitudes/types"

// Los enums viajan como texto (JsonStringEnumConverter en el backend).
export const BANCOS = ["Lafise", "Ficohsa", "BacCredomatic", "Banpro"] as const
export type Banco = (typeof BANCOS)[number]

export const NOMBRE_BANCO: Record<Banco, string> = {
  Lafise: "LAFISE",
  Ficohsa: "FICOHSA",
  BacCredomatic: "BAC Credomatic",
  Banpro: "Banpro",
}

/** Un crédito está Aprobado (por desembolsar) o Desembolsado. */
export const ESTADOS_CREDITO = [
  "Aprobada",
  "Desembolsada",
] as const satisfies readonly EstadoSolicitud[]
export type EstadoCredito = (typeof ESTADOS_CREDITO)[number]

export type CreditoResumen = {
  id: number
  numeroCredito: string
  solicitudId: number
  cedula: string
  nombreCompleto: string
  monto: number
  tasaInteresAnual: number
  cantidadCuotas: number
  periodicidad: Periodicidad
  plazoMeses: number
  cuotaNivelada: number
  /** Estado de la solicitud que originó el crédito. */
  estado: EstadoCredito
  fechaCreacion: string
}

export type CreditoDetalle = CreditoResumen & {
  banco: Banco | null
  numeroCuenta: string | null
  fechaDesembolso: string | null
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
  totalCapital: number
  totalIntereses: number
  totalPagar: number
  cuotas: CuotaPlanPago[]
}

export type CreditosParams = {
  page: number
  pageSize: number
  search?: string
  estado?: EstadoCredito
}
