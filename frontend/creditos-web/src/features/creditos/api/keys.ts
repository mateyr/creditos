import type { CreditosParams } from "@/features/creditos/types"

/** Claves de caché de la feature; invalidar `all` refresca todas sus consultas. */
export const creditosKeys = {
  all: ["creditos"] as const,
  list: (params: CreditosParams) =>
    [...creditosKeys.all, "list", params] as const,
}
