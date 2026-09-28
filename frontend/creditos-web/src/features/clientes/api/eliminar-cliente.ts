import { useMutation, useQueryClient } from "@tanstack/react-query"

import { clientesKeys } from "@/features/clientes/api/keys"
import { apiClient } from "@/lib/api-client"
import type { MutationConfig } from "@/lib/react-query"

export async function eliminarCliente(id: number) {
  await apiClient.delete(`/clientes/${id}`)
}

export function useEliminarCliente({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof eliminarCliente> } = {}) {
  const queryClient = useQueryClient()
  const { onSuccess, ...config } = mutationConfig ?? {}

  return useMutation({
    ...config,
    mutationFn: eliminarCliente,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: clientesKeys.all })
      await onSuccess?.(...args)
    },
  })
}
