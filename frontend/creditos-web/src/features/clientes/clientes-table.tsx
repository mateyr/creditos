import {
  createColumnHelper,
  rowPaginationFeature,
  tableFeatures,
  useTable,
  type PaginationState,
  type Updater,
} from "@tanstack/react-table"
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Cliente } from "@/features/clientes/api"
import { formatDate } from "@/lib/format"
import type { PagedResponse } from "@/lib/pagination"

const features = tableFeatures({ rowPaginationFeature })

const columnHelper = createColumnHelper<typeof features, Cliente>()

type ClientesTableProps = {
  /** Página ya filtrada y paginada por el backend. */
  clientes: PagedResponse<Cliente>
  onPageChange: (page: number) => void
  onEditar: (cliente: Cliente) => void
  onEliminar: (cliente: Cliente) => void
}

export function ClientesTable({
  clientes,
  onPageChange,
  onEditar,
  onEliminar,
}: ClientesTableProps) {
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("cedula", { header: "Cédula" }),
        columnHelper.accessor("nombreCompleto", { header: "Nombre completo" }),
        columnHelper.accessor("correoElectronico", { header: "Correo" }),
        columnHelper.accessor("telefono", { header: "Teléfono" }),
        columnHelper.accessor("fechaNacimiento", {
          header: "Fecha de nacimiento",
          cell: (info) => formatDate(info.getValue()),
        }),
        columnHelper.accessor("edad", { header: "Edad" }),
        columnHelper.display({
          id: "acciones",
          header: () => <span className="sr-only">Acciones</span>,
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Acciones de ${row.original.nombreCompleto}`}
                  />
                }
              >
                <EllipsisVerticalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditar(row.original)}>
                  <PencilIcon />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onEliminar(row.original)}
                >
                  <Trash2Icon />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        }),
      ]),
    [onEditar, onEliminar]
  )

  // La página vive en la URL; la tabla solo la refleja (índice base 0).
  const pagination: PaginationState = {
    pageIndex: clientes.page - 1,
    pageSize: clientes.pageSize,
  }

  const table = useTable(
    {
      features,
      columns,
      data: clientes.items,
      manualPagination: true,
      rowCount: clientes.totalCount,
      state: { pagination },
      onPaginationChange: (updater: Updater<PaginationState>) => {
        const next =
          typeof updater === "function" ? updater(pagination) : updater
        onPageChange(next.pageIndex + 1)
      },
    },
    (state) => ({ pagination: state.pagination })
  )

  const rows = table.getRowModel().rows

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>
          {clientes.totalCount}{" "}
          {clientes.totalCount === 1 ? "cliente" : "clientes"}
        </span>
        <div className="flex items-center gap-2">
          <span>
            Página {clientes.page} de {Math.max(clientes.totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
