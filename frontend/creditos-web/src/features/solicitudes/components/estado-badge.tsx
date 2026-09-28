import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import type { EstadoSolicitud } from "@/features/solicitudes/types"

const estilos: Record<EstadoSolicitud, string> = {
  Pendiente:
    "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300",
  Aprobada: "bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-300",
  Rechazada: "bg-red-100 text-red-900 dark:bg-red-500/15 dark:text-red-300",
  Desembolsada:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300",
}

export function EstadoBadge({ estado }: { estado: EstadoSolicitud }) {
  return (
    <Badge variant="secondary" className={cn("border-0", estilos[estado])}>
      {estado}
    </Badge>
  )
}
