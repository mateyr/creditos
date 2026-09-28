import { useMutation, useQueryClient } from "@tanstack/react-query"

import { creditosKeys } from "@/features/creditos/api/keys"
import type { DesembolsoRequest } from "@/features/creditos/schemas"
import { solicitudesKeys } from "@/features/solicitudes/api/keys"
import { apiClient } from "@/lib/api-client"
import type { MutationConfig } from "@/lib/react-query"

export async function desembolsarCredito({
  creditoId,
  request,
}: {
  creditoId: number
  request: DesembolsoRequest
}) {
  await apiClient.post(`/creditos/${creditoId}/desembolsar`, request)
}

export function useDesembolsarCredito({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof desembolsarCredito> } = {}) {
  const queryClient = useQueryClient()
  const { onSuccess, ...config } = mutationConfig ?? {}

  return useMutation({
    ...config,
    mutationFn: desembolsarCredito,
    onSuccess: async (...args) => {
      await Promise.all([
        // Detalle, lista y plan (las fechas de vencimiento se reprograman).
        queryClient.invalidateQueries({ queryKey: creditosKeys.all }),
        // La solicitud que originó el crédito pasa a Desembolsada.
        queryClient.invalidateQueries({ queryKey: solicitudesKeys.all }),
      ])
      await onSuccess?.(...args)
    },
  })
}
