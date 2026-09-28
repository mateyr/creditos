import { queryOptions } from "@tanstack/react-query"

import { solicitudesKeys } from "@/features/solicitudes/api/keys"
import type { PlanPagos } from "@/features/solicitudes/types"
import { apiClient } from "@/lib/api-client"

export async function getPlanPagos(solicitudId: number, signal?: AbortSignal) {
  const { data } = await apiClient.get<PlanPagos>(
    `/solicitudes/${solicitudId}/plan-pagos`,
    { signal }
  )
  return data
}

export const planPagosQueryOptions = (solicitudId: number) =>
  queryOptions({
    queryKey: solicitudesKeys.planPagos(solicitudId),
    queryFn: ({ signal }) => getPlanPagos(solicitudId, signal),
  })
