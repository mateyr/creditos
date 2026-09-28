import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { useCallback, useState } from "react"

import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { clientesQueryOptions } from "@/features/clientes/api/get-clientes"
import type { Cliente } from "@/features/clientes/types"
import { ClienteFormDialog } from "@/features/clientes/components/cliente-form-dialog"
import { ClientesTable } from "@/features/clientes/components/clientes-table"
import { EliminarClienteDialog } from "@/features/clientes/components/eliminar-cliente-dialog"
import { usePageInRange } from "@/hooks/use-page-in-range"
import {
  DEFAULT_PAGE_SIZE,
  paginationSearchDefaults,
  paginationSearchSchema,
} from "@/lib/pagination"

export const Route = createFileRoute("/_auth/clientes")({
  // La página y la búsqueda viven en la URL: se pueden compartir y el botón atrás funciona.
  validateSearch: paginationSearchSchema,
  search: { middlewares: [stripSearchParams(paginationSearchDefaults)] },
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
  const irAPagina = useCallback(
    (nextPage: number) =>
      void navigate({ search: (prev) => ({ ...prev, page: nextPage }) }),
    [navigate]
  )

  usePageInRange(page, clientes.totalPages, irAPagina)

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <PageHeader
        title="Clientes"
        description="Registro de clientes para las solicitudes de crédito."
      >
        <Button onClick={() => setFormulario({ open: true })}>
          <PlusIcon />
          Nuevo cliente
        </Button>
      </PageHeader>

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
        onPageChange={irAPagina}
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
