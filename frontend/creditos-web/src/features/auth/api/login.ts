import { useMutation } from "@tanstack/react-query"

import type { LoginRequest } from "@/features/auth/schemas"
import { apiClient } from "@/lib/api-client"
import { session } from "@/lib/session"

export async function login(request: LoginRequest) {
  const { data } = await apiClient.post<{ accessToken: string }>(
    "/auth/login",
    request
  )
  return data
}

/** Inicia sesión; el refresh token queda en la cookie httpOnly que envía el backend. */
export function useLogin({ onSuccess }: { onSuccess?: () => void } = {}) {
  return useMutation({
    mutationFn: login,
    onSuccess: ({ accessToken }) => {
      session.start(accessToken)
      onSuccess?.()
    },
  })
}
