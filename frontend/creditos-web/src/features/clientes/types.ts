export type Cliente = {
  id: number
  cedula: string
  nombreCompleto: string
  correoElectronico: string
  telefono: string
  /** Fecha en formato ISO (YYYY-MM-DD). */
  fechaNacimiento: string
  edad: number
}

export type ClientesParams = {
  page: number
  pageSize: number
  search?: string
}
