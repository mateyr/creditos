import { queryOptions } from "@tanstack/react-query"

import { creditosKeys } from "@/features/creditos/api/keys"
import type { PlanPagos } from "@/features/creditos/types"
import { apiClient } from "@/lib/api-client"

export async function getPlanPagos(creditoId: number, signal?: AbortSignal) {
  const { data } = await apiClient.get<PlanPagos>(
    `/creditos/${creditoId}/plan-pagos`,
    { signal }
  )
  return data
}

export const planPagosQueryOptions = (creditoId: number) =>
  queryOptions({
    queryKey: creditosKeys.planPagos(creditoId),
    queryFn: ({ signal }) => getPlanPagos(creditoId, signal),
  })
