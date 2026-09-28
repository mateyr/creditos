import { useQuery } from "@tanstack/react-query"
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"

import { DataTable } from "@/components/data-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { planPagosQueryOptions } from "@/features/creditos/api/get-plan-pagos"
import type { CuotaPlanPago, PlanPagos } from "@/features/creditos/types"
import { getErrorMessage } from "@/lib/api-client"
import { formatCurrency, formatDate } from "@/lib/format"

const features = tableFeatures({})

const columnHelper = createColumnHelper<typeof features, CuotaPlanPago>()

const moneda = (header: string) => ({
  header,
  cell: (info: { getValue: () => number }) => (
    <span className="tabular-nums">{formatCurrency(info.getValue())}</span>
  ),
})

const columns = columnHelper.columns([
  columnHelper.accessor("numeroCuota", { header: "N.º" }),
  columnHelper.accessor("fechaVencimiento", {
    header: "Vencimiento",
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.accessor("cuota", moneda("Cuota")),
  columnHelper.accessor("capital", moneda("Capital")),
  columnHelper.accessor("interes", moneda("Interés")),
  columnHelper.accessor("saldo", moneda("Saldo")),
])

type PlanPagosCardProps = {
  creditoId: number
  /** Tras el desembolso los vencimientos se cuentan desde esa fecha y ya no cambian. */
  desembolsado: boolean
}

/** Tabla de amortización del crédito generada al aprobar la solicitud. */
export function PlanPagosCard({ creditoId, desembolsado }: PlanPagosCardProps) {
  const {
    data: plan,
    error,
    isPending,
  } = useQuery(planPagosQueryOptions(creditoId))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan de pagos</CardTitle>
        <CardDescription>
          Cuota nivelada: cada cuota paga primero el interés del periodo y el
          resto amortiza el capital.{" "}
          {desembolsado
            ? "Los vencimientos se cuentan desde la fecha del desembolso."
            : "Las fechas son estimadas: se recalculan desde el día del desembolso."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
        ) : (
          <PlanPagosDetalle plan={plan} />
        )}
      </CardContent>
    </Card>
  )
}

function PlanPagosDetalle({ plan }: { plan: PlanPagos }) {
  const table = useTable({ features, columns, data: plan.cuotas })

  return (
    <>
      <dl className="grid gap-4 text-sm sm:grid-cols-4">
        <Total label="Cuotas" value={String(plan.cuotas.length)} />
        <Total label="Capital" value={formatCurrency(plan.totalCapital)} />
        <Total label="Intereses" value={formatCurrency(plan.totalIntereses)} />
        <Total label="Total a pagar" value={formatCurrency(plan.totalPagar)} />
      </dl>
      <DataTable
        table={table}
        emptyMessage="El crédito no tiene cuotas."
        className="max-h-112"
      />
    </>
  )
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium tabular-nums">{value}</dd>
    </div>
  )
}
