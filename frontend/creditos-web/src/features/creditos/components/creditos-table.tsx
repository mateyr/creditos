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
import { PERIODICIDAD_PLURAL } from "@/features/solicitudes/types"
import { formatCurrency, formatDateOnly, formatNumber } from "@/lib/format"
import type { PagedResponse } from "@/lib/pagination"

// La paginación y la búsqueda las hace el backend; la tabla solo renderiza la página recibida.
const features = tableFeatures({})

const columnHelper = createColumnHelper<typeof features, CreditoResumen>()

/** Celda de dos líneas: el dato principal y, debajo, su detalle en texto secundario. */
function DosLineas({
  principal,
  detalle,
}: {
  principal: string
  detalle: string
}) {
  return (
    <div className="flex flex-col">
      <span>{principal}</span>
      <span className="text-xs text-muted-foreground">{detalle}</span>
    </div>
  )
}

const columns = columnHelper.columns([
  columnHelper.accessor("numeroCredito", {
    header: "Crédito",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("nombreCompleto", {
    header: "Cliente",
    cell: ({ row }) => (
      <DosLineas
        principal={row.original.nombreCompleto}
        detalle={row.original.cedula}
      />
    ),
  }),
  columnHelper.accessor("monto", {
    header: "Monto",
    cell: ({ row }) => (
      <DosLineas
        principal={formatCurrency(row.original.monto)}
        detalle={`${formatNumber(row.original.tasaInteresAnual)} % anual`}
      />
    ),
  }),
  columnHelper.accessor("cuotaNivelada", {
    header: "Cuota",
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor("plazoMeses", {
    header: "Plazo",
    cell: ({ row }) => (
      <DosLineas
        principal={`${formatNumber(row.original.plazoMeses)} meses`}
        detalle={`${row.original.cantidadCuotas} cuotas ${PERIODICIDAD_PLURAL[row.original.periodicidad]}`}
      />
    ),
  }),
  columnHelper.accessor("estado", {
    header: "Estado",
    cell: (info) => <EstadoBadge estado={info.getValue()} />,
  }),
  columnHelper.accessor("fechaCreacion", {
    header: "Aprobado",
    cell: (info) => formatDateOnly(info.getValue()),
  }),
  columnHelper.display({
    id: "acciones",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => {
      const porDesembolsar = row.original.estado === "Aprobada"

      return (
        <Button
          variant={porDesembolsar ? "default" : "outline"}
          size="sm"
          className="w-28"
          nativeButton={false}
          render={
            <Link
              to="/creditos/$creditoId"
              params={{ creditoId: row.original.id }}
            />
          }
        >
          {porDesembolsar ? "Desembolsar" : "Ver"}
        </Button>
      )
    },
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
