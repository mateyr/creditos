import { DetailItem } from "@/components/detail-item"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SolicitudDetalle } from "@/features/solicitudes/types"
import { EstadoBadge } from "@/features/solicitudes/components/estado-badge"
import { formatDateTime } from "@/lib/format"

/** Dictamen ya emitido por el comité (solicitud aprobada, rechazada o desembolsada). */
export function DictamenResultado({
  solicitud,
  className,
}: {
  solicitud: SolicitudDetalle
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Dictamen <EstadoBadge estado={solicitud.estado} />
        </CardTitle>
        {solicitud.fechaDictamen && (
          <CardDescription>
            Emitido el {formatDateTime(solicitud.fechaDictamen)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-5 text-sm">
          {solicitud.numeroCredito && (
            <DetailItem
              label="Número de crédito"
              value={solicitud.numeroCredito}
            />
          )}
          <DetailItem
            label={
              solicitud.estado === "Rechazada"
                ? "Motivo del rechazo"
                : "Observaciones"
            }
            value={solicitud.observaciones ?? "—"}
          />
        </dl>
      </CardContent>
    </Card>
  )
}
