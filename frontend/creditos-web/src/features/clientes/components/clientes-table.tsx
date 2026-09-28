import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useMemo } from "react"

import { DataTable, DataTablePagination } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Cliente } from "@/features/clientes/types"
import { formatDate } from "@/lib/format"
import type { PagedResponse } from "@/lib/pagination"

// La paginación y la búsqueda las hace el backend; la tabla solo renderiza la página recibida.
const features = tableFeatures({})

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

  const table = useTable({ features, columns, data: clientes.items })

  return (
    <div className="flex flex-col gap-4">
      <DataTable table={table} emptyMessage="No se encontraron clientes." />
      <DataTablePagination
        data={clientes}
        onPageChange={onPageChange}
        itemLabel={["cliente", "clientes"]}
      />
    </div>
  )
}
