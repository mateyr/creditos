import type { UseMutationOptions } from "@tanstack/react-query"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncFn = (...args: any[]) => Promise<unknown>

/**
 * Opciones extra que un componente puede pasar a un hook de mutación de una feature
 * (p. ej. mostrar un aviso en onSuccess). La función de la mutación y la invalidación
 * de la caché las define el hook, no el componente.
 */
export type MutationConfig<TMutationFn extends AsyncFn> = Omit<
  UseMutationOptions<
    Awaited<ReturnType<TMutationFn>>,
    Error,
    Parameters<TMutationFn>[0]
  >,
  "mutationFn"
>
