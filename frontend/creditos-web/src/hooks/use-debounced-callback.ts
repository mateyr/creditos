import { useEffect, useMemo, useRef } from "react"

/** Devuelve una versión de `callback` que solo se ejecuta tras `delay` ms sin nuevas llamadas. */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number
) {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return useMemo(
    () =>
      (...args: TArgs) => {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(
          () => callbackRef.current(...args),
          delay
        )
      },
    [delay]
  )
}
