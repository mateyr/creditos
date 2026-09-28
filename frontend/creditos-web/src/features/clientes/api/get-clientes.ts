import { queryOptions } from "@tanstack/react-query"

import { clientesKeys } from "@/features/clientes/api/keys"
import type { Cliente, ClientesParams } from "@/features/clientes/types"
import { apiClient } from "@/lib/api-client"
import type { PagedResponse } from "@/lib/pagination"

export async function getClientes(
  params: ClientesParams,
  signal?: AbortSignal
) {
  const { data } = await apiClient.get<PagedResponse<Cliente>>("/clientes", {
    // Una búsqueda vacía no se envía para no filtrar por "".
    params: { ...params, search: params.search || undefined },
    signal,
  })
  return data
}

export const clientesQueryOptions = (params: ClientesParams) =>
  queryOptions({
    queryKey: clientesKeys.list(params),
    queryFn: ({ signal }) => getClientes(params, signal),
  })
