import type { SolicitudesParams } from "@/features/solicitudes/types"

/** Claves de caché de la feature; invalidar `all` refresca todas sus consultas. */
export const solicitudesKeys = {
  all: ["solicitudes"] as const,
  list: (params: SolicitudesParams) =>
    [...solicitudesKeys.all, "list", params] as const,
  detail: (id: number) => [...solicitudesKeys.all, "detail", id] as const,
}
