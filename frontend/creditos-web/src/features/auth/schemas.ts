import { z } from "zod"

export const loginSchema = z.object({
  userName: z.string().trim().min(1, "El usuario es requerido."),
  password: z.string().min(1, "La contraseña es requerida."),
})

export type LoginRequest = z.infer<typeof loginSchema>
