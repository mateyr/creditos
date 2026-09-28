import { queryOptions } from "@tanstack/react-query"

import { solicitudesKeys } from "@/features/solicitudes/api/keys"
import type {
  SolicitudesParams,
  SolicitudResumen,
} from "@/features/solicitudes/types"
import { apiClient } from "@/lib/api-client"
import type { PagedResponse } from "@/lib/pagination"

export async function getSolicitudes(
  params: SolicitudesParams,
  signal?: AbortSignal
) {
  const { data } = await apiClient.get<PagedResponse<SolicitudResumen>>(
    "/solicitudes",
    {
      // Una búsqueda vacía no se envía para no filtrar por "".
      params: { ...params, search: params.search || undefined },
      signal,
    }
  )
  return data
}

export const solicitudesQueryOptions = (params: SolicitudesParams) =>
  queryOptions({
    queryKey: solicitudesKeys.list(params),
    queryFn: ({ signal }) => getSolicitudes(params, signal),
  })
