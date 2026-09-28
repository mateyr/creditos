import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { z } from "zod"

import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { clientesQueryOptions, type Cliente } from "@/features/clientes/api"
import { ClienteFormDialog } from "@/features/clientes/cliente-form-dialog"
import { ClientesTable } from "@/features/clientes/clientes-table"
import { EliminarClienteDialog } from "@/features/clientes/eliminar-cliente-dialog"
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination"

const searchDefaults = { page: 1, search: "" }

const clientesSearchSchema = z.object({
  page: z
    .number()
    .int()
    .min(1)
    .default(searchDefaults.page)
    .catch(searchDefaults.page),
  search: z
    .string()
    .max(150)
    .default(searchDefaults.search)
    .catch(searchDefaults.search),
})

export const Route = createFileRoute("/_auth/clientes")({
  // La página y la búsqueda viven en la URL: se pueden compartir y el botón atrás funciona.
  validateSearch: clientesSearchSchema,
  search: { middlewares: [stripSearchParams(searchDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      clientesQueryOptions({ ...deps, pageSize: DEFAULT_PAGE_SIZE })
    ),
  component: ClientesPage,
})

type FormularioState = { open: boolean; cliente?: Cliente }

function ClientesPage() {
  const { page, search } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: clientes } = useSuspenseQuery(
    clientesQueryOptions({ page, search, pageSize: DEFAULT_PAGE_SIZE })
  )
  const [formulario, setFormulario] = useState<FormularioState>({
    open: false,
  })
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null)
  const editarCliente = useCallback(
    (cliente: Cliente) => setFormulario({ open: true, cliente }),
    []
  )

  // Si se elimina el último cliente de la última página, se retrocede a la anterior.
  useEffect(() => {
    if (clientes.totalPages > 0 && page > clientes.totalPages) {
      void navigate({
        search: (prev) => ({ ...prev, page: clientes.totalPages }),
        replace: true,
      })
    }
  }, [clientes.totalPages, page, navigate])

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-medium">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Registro de clientes para las solicitudes de crédito.
          </p>
        </div>
        <Button onClick={() => setFormulario({ open: true })}>
          <PlusIcon />
          Nuevo cliente
        </Button>
      </div>

      <SearchInput
        className="max-w-sm"
        value={search}
        placeholder="Buscar por cédula, nombre, correo o teléfono"
        onSearch={(value) =>
          void navigate({
            // Una búsqueda nueva siempre empieza en la primera página.
            search: (prev) => ({ ...prev, search: value, page: 1 }),
            replace: true,
          })
        }
      />

      <ClientesTable
        clientes={clientes}
        onPageChange={(nextPage) =>
          void navigate({ search: (prev) => ({ ...prev, page: nextPage }) })
        }
        onEditar={editarCliente}
        onEliminar={setClienteAEliminar}
      />

      <ClienteFormDialog
        open={formulario.open}
        onOpenChange={(open) =>
          setFormulario((actual) => ({ ...actual, open }))
        }
        cliente={formulario.cliente}
      />
      <EliminarClienteDialog
        cliente={clienteAEliminar}
        onClose={() => setClienteAEliminar(null)}
      />
    </div>
  )
}
