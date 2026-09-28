import { z } from "zod"

/** Página de resultados que devuelve el backend (PagedResponse). */
export type PagedResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export const DEFAULT_PAGE_SIZE = 10

export const paginationSearchDefaults = { page: 1, search: "" }

/**
 * Parámetros de página y búsqueda en la URL de las listas. Los valores inválidos
 * vuelven al valor por defecto en lugar de romper la ruta.
 */
export const paginationSearchSchema = z.object({
  page: z
    .number()
    .int()
    .min(1)
    .default(paginationSearchDefaults.page)
    .catch(paginationSearchDefaults.page),
  search: z
    .string()
    .max(150)
    .default(paginationSearchDefaults.search)
    .catch(paginationSearchDefaults.search),
})
