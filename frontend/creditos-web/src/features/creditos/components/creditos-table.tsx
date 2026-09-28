import { Link } from "@tanstack/react-router"
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"

import { DataTable, DataTablePagination } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import type { CreditoResumen } from "@/features/creditos/types"
import { EstadoBadge } from "@/features/solicitudes/components/estado-badge"
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format"
import type { PagedResponse } from "@/lib/pagination"

// La paginación y la búsqueda las hace el backend; la tabla solo renderiza la página recibida.
const features = tableFeatures({})

const columnHelper = createColumnHelper<typeof features, CreditoResumen>()

const columns = columnHelper.columns([
  columnHelper.accessor("numeroCredito", {
    header: "Crédito",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("nombreCompleto", {
    header: "Cliente",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.nombreCompleto}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.cedula}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor("monto", {
    header: "Monto",
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor("tasaInteresAnual", {
    header: "Tasa",
    cell: (info) => `${formatNumber(info.getValue())} %`,
  }),
  columnHelper.accessor("cuotaNivelada", {
    header: "Cuota",
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor("cantidadCuotas", { header: "Cuotas" }),
  columnHelper.accessor("periodicidad", { header: "Periodicidad" }),
  columnHelper.accessor("plazoMeses", {
    header: "Plazo",
    cell: (info) => `${formatNumber(info.getValue())} meses`,
  }),
  columnHelper.accessor("estado", {
    header: "Estado",
    cell: (info) => <EstadoBadge estado={info.getValue()} />,
  }),
  columnHelper.accessor("fechaCreacion", {
    header: "Fecha de aprobación",
    cell: (info) => formatDateTime(info.getValue()),
  }),
  columnHelper.display({
    id: "acciones",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        className="w-20"
        nativeButton={false}
        render={
          <Link
            to="/solicitudes/$solicitudId"
            params={{ solicitudId: row.original.solicitudId }}
          />
        }
      >
        Ver
      </Button>
    ),
  }),
])

type CreditosTableProps = {
  creditos: PagedResponse<CreditoResumen>
  onPageChange: (page: number) => void
}

export function CreditosTable({ creditos, onPageChange }: CreditosTableProps) {
  const table = useTable({ features, columns, data: creditos.items })

  return (
    <div className="flex flex-col gap-4">
      <DataTable table={table} emptyMessage="No se encontraron créditos." />
      <DataTablePagination
        data={creditos}
        onPageChange={onPageChange}
        itemLabel={["crédito", "créditos"]}
      />
    </div>
  )
}
