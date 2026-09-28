import axios, { isAxiosError } from "axios"

import { session } from "@/lib/session"

/** Respuesta de error RFC 7807 que devuelve el backend (ProblemDetails / ValidationProblem). */
export type ProblemDetails = {
  title?: string
  detail?: string
  status?: number
  errors?: Record<string, string[]>
}

declare module "axios" {
  interface InternalAxiosRequestConfig {
    /** La petición ya se reintentó tras renovar el token. */
    reintentada?: boolean
  }
}

const BASE_URL = "/api"

/** Margen para renovar el access token antes de que venza. */
const MARGEN_RENOVACION_MS = 30_000

// Mismo origen en dev (proxy de Vite) y en Docker (nginx), por eso basta con /api.
export const apiClient = axios.create({ baseURL: BASE_URL })

let renovacionEnCurso: Promise<string | null> | null = null

/**
 * Pide un nuevo access token. El refresh token viaja en la cookie httpOnly, que el navegador
 * envía solo. Si varias peticiones lo necesitan a la vez, comparten la misma renovación: el
 * refresh token se rota en cada uso y solo sirve una vez. Si falla, se cierra la sesión.
 */
function renovarAccessToken(): Promise<string | null> {
  renovacionEnCurso ??= axios
    // axios sin interceptores: esta petición no debe volver a pasar por la renovación.
    .post<{ accessToken: string }>(`${BASE_URL}/auth/refresh`)
    .then(({ data }) => {
      session.start(data.accessToken)
      return data.accessToken
    })
    .catch(() => {
      session.clear()
      return null
    })
    .finally(() => {
      renovacionEnCurso = null
    })

  return renovacionEnCurso
}

/**
 * Devuelve la sesión actual o intenta recuperarla con la cookie del refresh token
 * (p. ej. al recargar la página). Devuelve null si no hay sesión válida.
 */
export async function ensureSession() {
  if (!session.get()) {
    await renovarAccessToken()
  }

  return session.get()
}

apiClient.interceptors.request.use(async (config) => {
  let actual = session.get()

  // Si el access token está por vencer, se renueva antes de enviar para evitar un 401.
  if (actual && actual.expiresAt - Date.now() < MARGEN_RENOVACION_MS) {
    await renovarAccessToken()
    actual = session.get()
  }

  if (actual) {
    config.headers.Authorization = `Bearer ${actual.accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(undefined, async (error) => {
  const config = isAxiosError(error) ? error.config : undefined

  // Token rechazado (p. ej. revocado): se renueva una vez y se repite la petición.
  if (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    config?.headers.Authorization &&
    !config.reintentada
  ) {
    config.reintentada = true
    const accessToken = await renovarAccessToken()

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(config)
    }
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
