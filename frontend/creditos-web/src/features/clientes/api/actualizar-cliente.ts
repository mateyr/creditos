import { useMutation, useQueryClient } from "@tanstack/react-query"

import { clientesKeys } from "@/features/clientes/api/keys"
import type { ClienteRequest } from "@/features/clientes/schemas"
import { apiClient } from "@/lib/api-client"
import type { MutationConfig } from "@/lib/react-query"

export async function actualizarCliente({
  id,
  request,
}: {
  id: number
  request: ClienteRequest
}) {
  await apiClient.put(`/clientes/${id}`, request)
}

export function useActualizarCliente({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof actualizarCliente> } = {}) {
  const queryClient = useQueryClient()
  const { onSuccess, ...config } = mutationConfig ?? {}

  return useMutation({
    ...config,
    mutationFn: actualizarCliente,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: clientesKeys.all })
      await onSuccess?.(...args)
    },
  })
}
