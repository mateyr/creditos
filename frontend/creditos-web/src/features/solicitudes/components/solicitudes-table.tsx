import { Link } from "@tanstack/react-router"
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"

import { DataTable, DataTablePagination } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import type { SolicitudResumen } from "@/features/solicitudes/types"
import { EstadoBadge } from "@/features/solicitudes/components/estado-badge"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { PagedResponse } from "@/lib/pagination"

// La paginación y los filtros los hace el backend; la tabla solo renderiza la página recibida.
const features = tableFeatures({})

const columnHelper = createColumnHelper<typeof features, SolicitudResumen>()

const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "N.º",
    cell: (info) => (
      <span className="text-muted-foreground tabular-nums">
        #{info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("nombreCompleto", {
    header: "Cliente",
    cell: ({ row }) => (
      <Link
        to="/solicitudes/$solicitudId"
        params={{ solicitudId: row.original.id }}
        className="flex flex-col hover:underline"
      >
        <span className="font-medium">{row.original.nombreCompleto}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.cedula}
        </span>
      </Link>
    ),
  }),
  columnHelper.accessor("edad", {
    header: "Edad",
    cell: (info) => `${info.getValue()} años`,
  }),
  columnHelper.accessor("montoSolicitado", {
    header: "Monto solicitado",
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
  columnHelper.display({
    id: "acciones",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => {
      const pendiente = row.original.estado === "Pendiente"

      return (
        <Button
          variant={pendiente ? "default" : "outline"}
          size="sm"
          className="w-20"
          nativeButton={false}
          render={
            <Link
              to="/solicitudes/$solicitudId"
              params={{ solicitudId: row.original.id }}
            />
          }
        >
          {pendiente ? "Evaluar" : "Ver"}
        </Button>
      )
    },
  }),
])

type SolicitudesTableProps = {
  solicitudes: PagedResponse<SolicitudResumen>
  onPageChange: (page: number) => void
}

export function SolicitudesTable({
  solicitudes,
  onPageChange,
}: SolicitudesTableProps) {
  const table = useTable({ features, columns, data: solicitudes.items })

  return (
    <div className="flex flex-col gap-4">
      <DataTable table={table} emptyMessage="No se encontraron solicitudes." />
      <DataTablePagination
        data={solicitudes}
        onPageChange={onPageChange}
        itemLabel={["solicitud", "solicitudes"]}
      />
    </div>
  )
}
