import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { apiClient } from "@/lib/api-client"
import type { PagedResponse } from "@/lib/pagination"

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

/** Fecha local de hoy en formato YYYY-MM-DD, comparable como texto con el valor de un input date. */
const hoy = () => new Date().toLocaleDateString("en-CA")

// Mismas reglas que ClienteRequestValidator en el backend.
export const clienteSchema = z.object({
  cedula: z
    .string()
    .trim()
    .min(1, "La cédula es requerida.")
    .regex(
      /^\d{3}-\d{6}-\d{4}[A-Z]$/,
      "La cédula debe tener el formato 000-000000-0000A."
    ),
  nombreCompleto: z
    .string()
    .trim()
    .min(1, "El nombre completo es requerido.")
    .max(150, "El nombre completo no puede superar los 150 caracteres."),
  correoElectronico: z
    .email("El correo electrónico no es válido.")
    .max(150, "El correo electrónico no puede superar los 150 caracteres."),
  telefono: z
    .string()
    .trim()
    .min(1, "El teléfono es requerido.")
    .max(20, "El teléfono no puede superar los 20 caracteres."),
  fechaNacimiento: z.iso
    .date("La fecha de nacimiento es requerida.")
    .refine((fecha) => fecha < hoy(), "La fecha de nacimiento no es válida."),
})

export type ClienteRequest = z.infer<typeof clienteSchema>

export type ClientesParams = {
  page: number
  pageSize: number
  search?: string
}

export const clientesKeys = {
  all: ["clientes"] as const,
  list: (params: ClientesParams) =>
    [...clientesKeys.all, "list", params] as const,
}

export const clientesQueryOptions = (params: ClientesParams) =>
  queryOptions({
    queryKey: clientesKeys.list(params),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<PagedResponse<Cliente>>(
        "/clientes",
        // Una búsqueda vacía no se envía para no filtrar por "".
        { params: { ...params, search: params.search || undefined }, signal }
      )
      return data
    },
  })

export async function crearCliente(request: ClienteRequest) {
  const { data } = await apiClient.post<{ id: number }>("/clientes", request)
  return data
}

export async function actualizarCliente(id: number, request: ClienteRequest) {
  await apiClient.put(`/clientes/${id}`, request)
}

export async function eliminarCliente(id: number) {
  await apiClient.delete(`/clientes/${id}`)
}
