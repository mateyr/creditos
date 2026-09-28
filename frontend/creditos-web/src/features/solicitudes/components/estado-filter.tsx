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

type EstadoFilterProps<TEstado extends EstadoSolicitud> = {
  value: TEstado | undefined
  onChange: (estado: TEstado | undefined) => void
  /** Estados que se pueden elegir; por defecto, todos los de una solicitud. */
  estados?: readonly TEstado[]
  /** Texto a mostrar por estado, p. ej. "Por desembolsar" en lugar de "Aprobada". */
  etiquetas?: Partial<Record<TEstado, string>>
}

export function EstadoFilter<TEstado extends EstadoSolicitud>({
  value,
  onChange,
  estados = ESTADOS_SOLICITUD as readonly EstadoSolicitud[] as readonly TEstado[],
  etiquetas,
}: EstadoFilterProps<TEstado>) {
  const opciones = [
    { value: TODOS, label: "Todos los estados" },
    ...estados.map((estado) => ({
      value: estado,
      label: etiquetas?.[estado] ?? estado,
    })),
  ]

  return (
    <Select
      items={opciones}
      value={value ?? TODOS}
      onValueChange={(next) =>
        onChange(next === TODOS || !next ? undefined : (next as TEstado))
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
