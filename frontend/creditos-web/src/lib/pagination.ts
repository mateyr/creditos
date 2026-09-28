/** Página de resultados que devuelve el backend (PagedResponse). */
export type PagedResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export const DEFAULT_PAGE_SIZE = 10
