import { DetailItem } from "@/components/detail-item"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CreditoDetalle } from "@/features/creditos/types"
import { formatCurrency, formatNumber } from "@/lib/format"

/** Datos básicos del crédito que la pantalla de desembolso debe mostrar (y solo esos). */
export function DatosCredito({
  credito,
  className,
}: {
  credito: CreditoDetalle
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Datos del crédito</CardTitle>
        <CardDescription>Información de solo lectura.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-6 gap-y-5 text-sm sm:grid-cols-2">
          <DetailItem label="Cédula / Identificación" value={credito.cedula} />
          <DetailItem label="Nombre completo" value={credito.nombreCompleto} />
          <DetailItem label="Monto" value={formatCurrency(credito.monto)} />
          <DetailItem
            label="Tasa de interés anual"
            value={`${formatNumber(credito.tasaInteresAnual)} %`}
          />
          <DetailItem
            label="Periodicidad de pago"
            value={credito.periodicidad}
          />
          <DetailItem
            label="Plazo"
            value={`${formatNumber(credito.plazoMeses)} meses`}
          />
        </dl>
      </CardContent>
    </Card>
  )
}
