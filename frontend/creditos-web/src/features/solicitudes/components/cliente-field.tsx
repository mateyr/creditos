import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { useFieldContext } from "@/components/form/form-context"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { clientesQueryOptions } from "@/features/clientes/api/get-clientes"
import type { Cliente } from "@/features/clientes/types"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"

/** Regla de negocio: no se reciben solicitudes de clientes mayores de 80 años. */
export const EDAD_MAXIMA = 80

const RESULTADOS_POR_BUSQUEDA = 10

type ClienteFieldProps = {
  /** Se llama con el cliente seleccionado, para mostrar su información personal. */
  onClienteChange: (cliente: Cliente | null) => void
}

/**
 * Selector de cliente con búsqueda en el backend. El valor del campo es el id del cliente.
 * Los clientes mayores de 80 años aparecen deshabilitados.
 */
export function ClienteField({ onClienteChange }: ClienteFieldProps) {
  const field = useFieldContext<number | null>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const [search, setSearch] = useState("")
  const [seleccionado, setSeleccionado] = useState<Cliente | null>(null)
  const debouncedSetSearch = useDebouncedCallback(setSearch, 300)

  const { data, isFetching } = useQuery({
    ...clientesQueryOptions({
      page: 1,
      pageSize: RESULTADOS_POR_BUSQUEDA,
      search,
    }),
    placeholderData: keepPreviousData,
  })

  const clientes = data?.items ?? []

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Cliente</FieldLabel>
      <Combobox
        items={clientes}
        // El backend ya filtra por la búsqueda; el combobox no debe volver a filtrar.
        filter={null}
        value={seleccionado}
        onValueChange={(cliente) => {
          setSeleccionado(cliente)
          onClienteChange(cliente)
          field.handleChange(cliente?.id ?? null)
        }}
        onInputValueChange={(value, { reason }) => {
          // Solo lo que el usuario escribe es una búsqueda; al elegir un cliente el
          // input muestra su nombre y eso no debe volver a consultar la API.
          if (reason === "input-change") {
            debouncedSetSearch(value.trim())
          } else if (value === "") {
            setSearch("")
          }
        }}
        onOpenChange={(open) => !open && field.handleBlur()}
        itemToStringLabel={(cliente) => cliente.nombreCompleto}
        isItemEqualToValue={(a, b) => a.id === b.id}
      >
        <ComboboxInput
          id={field.name}
          placeholder="Buscar por cédula o nombre"
          aria-invalid={isInvalid}
          className="w-full"
          showClear={seleccionado !== null}
        />
        <ComboboxContent>
          <ComboboxEmpty>
            {isFetching ? "Buscando..." : "No se encontraron clientes."}
          </ComboboxEmpty>
          <ComboboxList>
            {(cliente: Cliente) => (
              <ComboboxItem
                key={cliente.id}
                value={cliente}
                disabled={cliente.edad > EDAD_MAXIMA}
              >
                <div className="flex flex-col">
                  <span>{cliente.nombreCompleto}</span>
                  <span className="text-xs text-muted-foreground">
                    {cliente.cedula} · {cliente.edad} años
                    {cliente.edad > EDAD_MAXIMA && " · mayor de 80 años"}
                  </span>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
