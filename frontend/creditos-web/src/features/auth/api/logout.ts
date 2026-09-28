import { apiClient } from "@/lib/api-client"
import { session } from "@/lib/session"

/**
 * Revoca el refresh token en el servidor (que además borra la cookie) y después cierra la sesión
 * en el navegador. En ese orden: si la sesión se limpiara primero, la pantalla de login intentaría
 * recuperarla con la cookie todavía válida.
 */
export async function logout() {
  await apiClient.post("/auth/logout").catch(() => undefined)
  session.clear()
}
