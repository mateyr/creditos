import { useEffect } from "react"

/**
 * Si la página actual quedó fuera de rango (p. ej. al eliminar el último registro de la
 * última página), llama a `onPageChange` con la última página disponible.
 */
export function usePageInRange(
  page: number,
  totalPages: number,
  onPageChange: (page: number) => void
) {
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      onPageChange(totalPages)
    }
  }, [page, totalPages, onPageChange])
}
