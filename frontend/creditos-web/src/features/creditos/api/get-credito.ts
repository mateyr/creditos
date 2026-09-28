import { queryOptions } from "@tanstack/react-query"

import { creditosKeys } from "@/features/creditos/api/keys"
import type { CreditoDetalle } from "@/features/creditos/types"
import { apiClient } from "@/lib/api-client"

export async function getCredito(id: number, signal?: AbortSignal) {
  const { data } = await apiClient.get<CreditoDetalle>(`/creditos/${id}`, {
    signal,
  })
  return data
}

export const creditoQueryOptions = (id: number) =>
  queryOptions({
    queryKey: creditosKeys.detail(id),
    queryFn: ({ signal }) => getCredito(id, signal),
  })
