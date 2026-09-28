import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  PERIODICIDAD_PLURAL,
  type Periodicidad,
} from "@/features/solicitudes/types"
import {
  calcularCuotaNivelada,
  calcularPlazoMeses,
} from "@/features/solicitudes/utils/cuota-nivelada"
import { formatCurrency, formatNumber } from "@/lib/format"

type CuotaResumenProps = {
  monto: number
  tasaInteresAnual: number
  cantidadCuotas: number
  periodicidad: Periodicidad | ""
}

/** Cálculo en vivo de la cuota nivelada mientras se llenan las condiciones del crédito. */
export function CuotaResumen({
  monto,
  tasaInteresAnual,
  cantidadCuotas,
  periodicidad,
}: CuotaResumenProps) {
  const cuota = periodicidad
    ? calcularCuotaNivelada(
        monto,
        tasaInteresAnual,
        cantidadCuotas,
        periodicidad
      )
    : null

  return (
    <Card>
      <CardHeader>
        <CardDescription>Cuota nivelada</CardDescription>
        <CardTitle className="text-3xl tabular-nums">
          {cuota !== null ? formatCurrency(cuota) : "—"}
        </CardTitle>
        {cuota !== null && periodicidad && (
          <p className="text-sm text-muted-foreground">
            {cantidadCuotas} cuotas {PERIODICIDAD_PLURAL[periodicidad]}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {cuota !== null && periodicidad ? (
          <>
            <Separator />
            <Fila
              label="Plazo"
              value={`${formatNumber(calcularPlazoMeses(cantidadCuotas, periodicidad))} meses`}
            />
            <Fila label="Monto solicitado" value={formatCurrency(monto)} />
            <Fila
              label="Intereses estimados"
              value={formatCurrency(cuota * cantidadCuotas - monto)}
            />
            <Fila
              label="Total a pagar"
              value={formatCurrency(cuota * cantidadCuotas)}
              destacado
            />
          </>
        ) : (
          <p className="text-muted-foreground">
            Ingresa el monto, la cantidad de cuotas, la tasa y la periodicidad
            para calcular la cuota.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function Fila({
  label,
  value,
  destacado = false,
}: {
  label: string
  value: string
  destacado?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={destacado ? "font-medium tabular-nums" : "tabular-nums"}>
        {value}
      </span>
    </div>
  )
}
