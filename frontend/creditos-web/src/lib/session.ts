import { useSyncExternalStore } from "react"

export type Session = {
  accessToken: string
  userName: string
  /** Momento de expiración del access token en milisegundos (epoch). */
  expiresAt: number
}

type JwtPayload = {
  unique_name?: string
  exp?: number
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload
  } catch {
    return null
  }
}

let current: Session | null = null
const listeners = new Set<() => void>()

function update(next: Session | null) {
  current = next
  listeners.forEach((listener) => listener())
}

/**
 * Sesión del usuario autenticado. El access token vive solo en memoria: el refresh token está en
 * una cookie httpOnly que JavaScript no puede leer, y al recargar la página la sesión se recupera
 * renovando el access token (ver `ensureSession` en api-client).
 * Vive fuera de React para poder leerla en los `beforeLoad` del router y en los interceptores de axios.
 */
export const session = {
  get: (): Session | null => current,

  /** Inicia la sesión o la actualiza con un access token renovado. */
  start(accessToken: string) {
    const payload = decodePayload(accessToken)

    if (!payload?.exp || !payload.unique_name) {
      throw new Error("El token de acceso recibido no es válido.")
    }

    update({
      accessToken,
      userName: payload.unique_name,
      expiresAt: payload.exp * 1000,
    })
  },

  clear() {
    if (current) {
      update(null)
    }
  },

  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

export function useSession() {
  return useSyncExternalStore(session.subscribe, session.get)
}
