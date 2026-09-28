import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ESTADOS_SOLICITUD,
  type EstadoSolicitud,
} from "@/features/solicitudes/types"

const TODOS = "todos"

const opciones = [
  { value: TODOS, label: "Todos los estados" },
  ...ESTADOS_SOLICITUD.map((estado) => ({ value: estado, label: estado })),
]

export function EstadoFilter({
  value,
  onChange,
}: {
  value: EstadoSolicitud | undefined
  onChange: (estado: EstadoSolicitud | undefined) => void
}) {
  return (
    <Select
      items={opciones}
      value={value ?? TODOS}
      onValueChange={(next) =>
        onChange(
          next === TODOS || !next ? undefined : (next as EstadoSolicitud)
        )
      }
    >
      <SelectTrigger className="w-48" aria-label="Filtrar por estado">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opciones.map((opcion) => (
          <SelectItem key={opcion.value} value={opcion.value}>
            {opcion.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
