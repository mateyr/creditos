import { useMutation } from "@tanstack/react-query"

import type { LoginRequest } from "@/features/auth/schemas"
import { apiClient } from "@/lib/api-client"
import { session } from "@/lib/session"

type LoginResponse = {
  accessToken: string
}

export async function login(request: LoginRequest) {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", request)
  return data
}

/** Inicia sesión y guarda el token recibido. */
export function useLogin({ onSuccess }: { onSuccess?: () => void } = {}) {
  return useMutation({
    mutationFn: login,
    onSuccess: ({ accessToken }) => {
      session.start(accessToken)
      onSuccess?.()
    },
  })
}
