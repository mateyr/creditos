import { Link } from "@tanstack/react-router"
import { ArrowRightIcon } from "lucide-react"

import { DetailItem } from "@/components/detail-item"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EstadoBadge } from "@/features/solicitudes/components/estado-badge"
import type { SolicitudDetalle } from "@/features/solicitudes/types"
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
      {solicitud.creditoId && (
        <CardFooter className="border-t">
          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={
              <Link
                to="/creditos/$creditoId"
                params={{ creditoId: solicitud.creditoId }}
              />
            }
          >
            Ver crédito {solicitud.numeroCredito}
            <ArrowRightIcon />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
