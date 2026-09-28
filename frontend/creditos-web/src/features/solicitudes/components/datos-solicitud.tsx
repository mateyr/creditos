import { DetailItem } from "@/components/detail-item"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SolicitudDetalle } from "@/features/solicitudes/types"
import { formatCurrency, formatNumber } from "@/lib/format"

/** Datos de solo lectura que el comité necesita para dictaminar (y solo esos). */
export function DatosSolicitud({
  solicitud,
  className,
}: {
  solicitud: SolicitudDetalle
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Datos para la evaluación</CardTitle>
        <CardDescription>Información de solo lectura.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-6 gap-y-5 text-sm sm:grid-cols-2">
          <DetailItem
            label="Cédula / Identificación"
            value={solicitud.cedula}
          />
          <DetailItem
            label="Nombre completo"
            value={solicitud.nombreCompleto}
          />
          <DetailItem label="Edad" value={`${solicitud.edad} años`} />
          <DetailItem
            label="Monto solicitado"
            value={formatCurrency(solicitud.montoSolicitado)}
          />
          <DetailItem
            label="Cantidad de cuotas"
            value={String(solicitud.cantidadCuotas)}
          />
          <DetailItem
            label="Periodicidad de pago"
            value={solicitud.periodicidad}
          />
          <DetailItem
            label="Plazo"
            value={`${formatNumber(solicitud.plazoMeses)} meses`}
          />
        </dl>
      </CardContent>
    </Card>
  )
}
