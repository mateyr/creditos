import { DetailItem } from "@/components/detail-item"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NOMBRE_BANCO, type CreditoDetalle } from "@/features/creditos/types"
import { formatDateTime } from "@/lib/format"

/** Transferencia ya realizada de un crédito desembolsado. */
export function DesembolsoResultado({
  credito,
  className,
}: {
  credito: CreditoDetalle
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Transferencia</CardTitle>
        {credito.fechaDesembolso && (
          <CardDescription>
            Desembolsado el {formatDateTime(credito.fechaDesembolso)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-5 text-sm">
          <DetailItem
            label="Banco destino"
            value={credito.banco ? NOMBRE_BANCO[credito.banco] : "—"}
          />
          <DetailItem
            label="Número de cuenta"
            value={credito.numeroCuenta ?? "—"}
          />
        </dl>
      </CardContent>
    </Card>
  )
}
