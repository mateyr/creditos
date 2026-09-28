import { z } from "zod"

import { apiClient } from "@/lib/api-client"

export const loginSchema = z.object({
  userName: z.string().trim().min(1, "El usuario es requerido."),
  password: z.string().min(1, "La contraseña es requerida."),
})

export type LoginRequest = z.infer<typeof loginSchema>

type LoginResponse = {
  accessToken: string
}

export async function login(request: LoginRequest) {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", request)
  return data
}
