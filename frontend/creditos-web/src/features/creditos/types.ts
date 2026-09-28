import type {
  EstadoSolicitud,
  Periodicidad,
} from "@/features/solicitudes/types"

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
  /** Estado de la solicitud que originó el crédito (Aprobada o Desembolsada). */
  estado: EstadoSolicitud
  fechaCreacion: string
}

export type CreditosParams = {
  page: number
  pageSize: number
  search?: string
}
