import { useSyncExternalStore } from "react"

const ACCESS_TOKEN_KEY = "creditos.accessToken"

export type Session = {
  accessToken: string
  userName: string
  /** Momento de expiración del token en milisegundos (epoch). */
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

/** Arma la sesión a partir del JWT; devuelve null si el token es inválido o ya expiró. */
function toSession(accessToken: string): Session | null {
  const payload = decodePayload(accessToken)

  if (!payload?.exp || !payload.unique_name) {
    return null
  }

  const expiresAt = payload.exp * 1000

  if (expiresAt <= Date.now()) {
    return null
  }

  return { accessToken, userName: payload.unique_name, expiresAt }
}

let current: Session | null = null
let expirationTimer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

function update(next: Session | null) {
  current = next
  clearTimeout(expirationTimer)

  if (next) {
    localStorage.setItem(ACCESS_TOKEN_KEY, next.accessToken)
    // Al vencer el token la sesión se cierra sola y el layout protegido redirige al login.
    expirationTimer = setTimeout(
      () => update(null),
      next.expiresAt - Date.now()
    )
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }

  listeners.forEach((listener) => listener())
}

/**
 * Sesión del usuario autenticado. Vive fuera de React para poder leerla en los
 * `beforeLoad` del router y en los interceptores de axios.
 */
export const session = {
  get: (): Session | null => current,

  start(accessToken: string) {
    const next = toSession(accessToken)

    if (!next) {
      throw new Error("El token de acceso recibido no es válido.")
    }

    update(next)
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

// Restaura la sesión guardada al recargar la página.
const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY)
if (storedToken) {
  update(toSession(storedToken))
}

export function useSession() {
  return useSyncExternalStore(session.subscribe, session.get)
}
