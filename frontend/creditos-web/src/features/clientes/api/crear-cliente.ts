import { useMutation, useQueryClient } from "@tanstack/react-query"

import { clientesKeys } from "@/features/clientes/api/keys"
import type { ClienteRequest } from "@/features/clientes/schemas"
import { apiClient } from "@/lib/api-client"
import type { MutationConfig } from "@/lib/react-query"

export async function crearCliente(request: ClienteRequest) {
  const { data } = await apiClient.post<{ id: number }>("/clientes", request)
  return data
}

export function useCrearCliente({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof crearCliente> } = {}) {
  const queryClient = useQueryClient()
  const { onSuccess, ...config } = mutationConfig ?? {}

  return useMutation({
    ...config,
    mutationFn: crearCliente,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: clientesKeys.all })
      await onSuccess?.(...args)
    },
  })
}
