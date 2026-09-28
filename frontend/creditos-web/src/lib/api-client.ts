import axios, { isAxiosError } from "axios"

import { session } from "@/lib/session"

/** Respuesta de error RFC 7807 que devuelve el backend (ProblemDetails / ValidationProblem). */
export type ProblemDetails = {
  title?: string
  detail?: string
  status?: number
  errors?: Record<string, string[]>
}

// Mismo origen en dev (proxy de Vite) y en Docker (nginx), por eso basta con /api.
export const apiClient = axios.create({
  baseURL: "/api",
})

apiClient.interceptors.request.use((config) => {
  const accessToken = session.get()?.accessToken

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(undefined, (error) => {
  // Token vencido o revocado: se cierra la sesión y el layout protegido redirige al login.
  if (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    error.config?.headers.Authorization
  ) {
    session.clear()
  }

  return Promise.reject(error)
})

/** Mensaje legible para mostrar al usuario a partir de un error de la API. */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ProblemDetails>(error)) {
    if (!error.response) {
      return "No se pudo conectar con el servidor."
    }

    const problem = error.response.data
    const firstValidationError = problem?.errors
      ? Object.values(problem.errors).flat()[0]
      : undefined

    return (
      firstValidationError ??
      problem?.detail ??
      problem?.title ??
      "Ocurrió un error inesperado."
    )
  }

  return "Ocurrió un error inesperado."
}
