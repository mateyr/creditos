import { useSuspenseQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  stripSearchParams,
} from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { useCallback } from "react"
import { z } from "zod"

import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { ESTADOS_SOLICITUD } from "@/features/solicitudes/types"
import { solicitudesQueryOptions } from "@/features/solicitudes/api/get-solicitudes"
import { EstadoFilter } from "@/features/solicitudes/components/estado-filter"
import { SolicitudesTable } from "@/features/solicitudes/components/solicitudes-table"
import { usePageInRange } from "@/hooks/use-page-in-range"
import {
  DEFAULT_PAGE_SIZE,
  paginationSearchDefaults,
  paginationSearchSchema,
} from "@/lib/pagination"

const solicitudesSearchSchema = paginationSearchSchema.extend({
  estado: z.enum(ESTADOS_SOLICITUD).optional().catch(undefined),
})

export const Route = createFileRoute("/_auth/solicitudes/")({
  validateSearch: solicitudesSearchSchema,
  search: { middlewares: [stripSearchParams(paginationSearchDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      solicitudesQueryOptions({ ...deps, pageSize: DEFAULT_PAGE_SIZE })
    ),
  component: SolicitudesPage,
})

function SolicitudesPage() {
  const { page, search, estado } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: solicitudes } = useSuspenseQuery(
    solicitudesQueryOptions({
      page,
      search,
      estado,
      pageSize: DEFAULT_PAGE_SIZE,
    })
  )
  const irAPagina = useCallback(
    (nextPage: number) =>
      void navigate({ search: (prev) => ({ ...prev, page: nextPage }) }),
    [navigate]
  )

  usePageInRange(page, solicitudes.totalPages, irAPagina)

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <PageHeader
        title="Solicitudes de crédito"
        description="Expedientes de crédito y su estado en el ciclo de aprobación."
      >
        <Button nativeButton={false} render={<Link to="/solicitudes/nueva" />}>
          <PlusIcon />
          Nueva solicitud
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          className="max-w-sm"
          value={search}
          placeholder="Buscar por cédula o nombre del cliente"
          onSearch={(value) =>
            void navigate({
              search: (prev) => ({ ...prev, search: value, page: 1 }),
              replace: true,
            })
          }
        />
        <EstadoFilter
          value={estado}
          onChange={(nextEstado) =>
            void navigate({
              search: (prev) => ({ ...prev, estado: nextEstado, page: 1 }),
              replace: true,
            })
          }
        />
      </div>

      <SolicitudesTable solicitudes={solicitudes} onPageChange={irAPagina} />
    </div>
  )
}
