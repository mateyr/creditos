import { queryOptions } from "@tanstack/react-query"

import { solicitudesKeys } from "@/features/solicitudes/api/keys"
import type { SolicitudDetalle } from "@/features/solicitudes/types"
import { apiClient } from "@/lib/api-client"

export async function getSolicitud(id: number, signal?: AbortSignal) {
  const { data } = await apiClient.get<SolicitudDetalle>(`/solicitudes/${id}`, {
    signal,
  })
  return data
}

export const solicitudQueryOptions = (id: number) =>
  queryOptions({
    queryKey: solicitudesKeys.detail(id),
    queryFn: ({ signal }) => getSolicitud(id, signal),
  })
