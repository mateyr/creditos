import type { ClientesParams } from "@/features/clientes/types"

/** Claves de caché de la feature; invalidar `all` refresca todas sus consultas. */
export const clientesKeys = {
  all: ["clientes"] as const,
  list: (params: ClientesParams) =>
    [...clientesKeys.all, "list", params] as const,
}
