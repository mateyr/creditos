import type { ReactTable, RowData, TableFeatures } from "@tanstack/react-table"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PagedResponse } from "@/lib/pagination"

type DataTableProps<TFeatures extends TableFeatures, TData extends RowData> = {
  // El selector de estado no importa aquí: la tabla solo lee modelos de filas y columnas.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: ReactTable<TFeatures, TData, any>
  emptyMessage: string
  /** Clases del contenedor, p. ej. una altura máxima para que la tabla haga scroll. */
  className?: string
}

/** Renderiza encabezados y filas de una tabla de TanStack Table con los estilos de la app. */
export function DataTable<
  TFeatures extends TableFeatures,
  TData extends RowData,
>({ table, emptyMessage, className }: DataTableProps<TFeatures, TData>) {
  const rows = table.getRowModel().rows

  return (
    <div className={cn("overflow-auto rounded-lg border", className)}>
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
                colSpan={table.getAllLeafColumns().length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

type DataTablePaginationProps = {
  /** Página devuelta por el backend; solo se usan sus datos de paginación. */
  data: Omit<PagedResponse<unknown>, "items">
  onPageChange: (page: number) => void
  /** Nombre del registro en singular y plural, p. ej. ["cliente", "clientes"]. */
  itemLabel: [singular: string, plural: string]
}

export function DataTablePagination({
  data,
  onPageChange,
  itemLabel,
}: DataTablePaginationProps) {
  const [singular, plural] = itemLabel

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
      <span>
        {data.totalCount} {data.totalCount === 1 ? singular : plural}
      </span>
      <div className="flex items-center gap-2">
        <span>
          Página {data.page} de {Math.max(data.totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(data.page - 1)}
          disabled={data.page <= 1}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(data.page + 1)}
          disabled={data.page >= data.totalPages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
