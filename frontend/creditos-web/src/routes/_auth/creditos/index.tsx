import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { useCallback } from "react"
import { z } from "zod"

import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { creditosQueryOptions } from "@/features/creditos/api/get-creditos"
import { CreditosTable } from "@/features/creditos/components/creditos-table"
import { ESTADOS_CREDITO } from "@/features/creditos/types"
import { EstadoFilter } from "@/features/solicitudes/components/estado-filter"
import { usePageInRange } from "@/hooks/use-page-in-range"
import {
  DEFAULT_PAGE_SIZE,
  paginationSearchDefaults,
  paginationSearchSchema,
} from "@/lib/pagination"

const creditosSearchSchema = paginationSearchSchema.extend({
  estado: z.enum(ESTADOS_CREDITO).optional().catch(undefined),
})

export const Route = createFileRoute("/_auth/creditos/")({
  validateSearch: creditosSearchSchema,
  search: { middlewares: [stripSearchParams(paginationSearchDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      creditosQueryOptions({ ...deps, pageSize: DEFAULT_PAGE_SIZE })
    ),
  component: CreditosPage,
})

function CreditosPage() {
  const { page, search, estado } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: creditos } = useSuspenseQuery(
    creditosQueryOptions({ page, search, estado, pageSize: DEFAULT_PAGE_SIZE })
  )
  const irAPagina = useCallback(
    (nextPage: number) =>
      void navigate({ search: (prev) => ({ ...prev, page: nextPage }) }),
    [navigate]
  )

  usePageInRange(page, creditos.totalPages, irAPagina)

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <PageHeader
        title="Créditos"
        description="Créditos otorgados por el comité de riesgo y su desembolso."
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          className="max-w-sm"
          value={search}
          placeholder="Buscar por número de crédito, cédula o nombre"
          onSearch={(value) =>
            void navigate({
              search: (prev) => ({ ...prev, search: value, page: 1 }),
              replace: true,
            })
          }
        />
        <EstadoFilter
          value={estado}
          estados={ESTADOS_CREDITO}
          etiquetas={{
            Aprobada: "Por desembolsar",
            Desembolsada: "Desembolsados",
          }}
          onChange={(nextEstado) =>
            void navigate({
              search: (prev) => ({ ...prev, estado: nextEstado, page: 1 }),
              replace: true,
            })
          }
        />
      </div>

      <CreditosTable creditos={creditos} onPageChange={irAPagina} />
    </div>
  )
}
