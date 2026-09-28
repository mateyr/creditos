import { useMutation, useQueryClient } from "@tanstack/react-query"

import { solicitudesKeys } from "@/features/solicitudes/api/keys"
import type { DictamenRequest } from "@/features/solicitudes/schemas"
import { apiClient } from "@/lib/api-client"
import type { MutationConfig } from "@/lib/react-query"

export type AccionDictamen = "aprobar" | "rechazar"

export type Dictamen = DictamenRequest & {
  solicitudId: number
  accion: AccionDictamen
}

type CreditoAprobado = {
  creditoId: number
  numeroCredito: string
  cantidadCuotas: number
}

/**
 * Emite el dictamen del comité. Aprobar devuelve el crédito creado con su plan de pagos;
 * rechazar no devuelve nada.
 */
export async function dictaminarSolicitud({
  solicitudId,
  accion,
  observaciones,
}: Dictamen): Promise<CreditoAprobado | null> {
  if (accion === "rechazar") {
    await apiClient.post(`/solicitudes/${solicitudId}/rechazar`, {
      observaciones,
    })
    return null
  }

  const { data } = await apiClient.post<CreditoAprobado>(
    `/solicitudes/${solicitudId}/aprobar`,
    { observaciones }
  )
  return data
}

export function useDictaminarSolicitud({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof dictaminarSolicitud> } = {}) {
  const queryClient = useQueryClient()
  const { onSuccess, ...config } = mutationConfig ?? {}

  return useMutation({
    ...config,
    mutationFn: dictaminarSolicitud,
    onSuccess: async (...args) => {
      // Refresca el detalle (muestra el dictamen y el plan) y las listas (cambia el estado).
      await queryClient.invalidateQueries({ queryKey: solicitudesKeys.all })
      await onSuccess?.(...args)
    },
  })
}
