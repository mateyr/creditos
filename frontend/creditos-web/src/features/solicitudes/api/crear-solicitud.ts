import { useMutation, useQueryClient } from "@tanstack/react-query"

import { solicitudesKeys } from "@/features/solicitudes/api/keys"
import type { CrearSolicitudRequest } from "@/features/solicitudes/schemas"
import { apiClient } from "@/lib/api-client"
import type { MutationConfig } from "@/lib/react-query"

export async function crearSolicitud(request: CrearSolicitudRequest) {
  const { data } = await apiClient.post<{ id: number; cuotaNivelada: number }>(
    "/solicitudes",
    request
  )
  return data
}

export function useCrearSolicitud({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof crearSolicitud> } = {}) {
  const queryClient = useQueryClient()
  const { onSuccess, ...config } = mutationConfig ?? {}

  return useMutation({
    ...config,
    mutationFn: crearSolicitud,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: solicitudesKeys.all })
      await onSuccess?.(...args)
    },
  })
}
