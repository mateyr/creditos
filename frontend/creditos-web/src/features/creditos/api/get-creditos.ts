import { queryOptions } from "@tanstack/react-query"

import { creditosKeys } from "@/features/creditos/api/keys"
import type { CreditoResumen, CreditosParams } from "@/features/creditos/types"
import { apiClient } from "@/lib/api-client"
import type { PagedResponse } from "@/lib/pagination"

export async function getCreditos(
  params: CreditosParams,
  signal?: AbortSignal
) {
  const { data } = await apiClient.get<PagedResponse<CreditoResumen>>(
    "/creditos",
    {
      // Una búsqueda vacía no se envía para no filtrar por "".
      params: { ...params, search: params.search || undefined },
      signal,
    }
  )
  return data
}

export const creditosQueryOptions = (params: CreditosParams) =>
  queryOptions({
    queryKey: creditosKeys.list(params),
    queryFn: ({ signal }) => getCreditos(params, signal),
  })
