import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"
import { z } from "zod"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { creditoQueryOptions } from "@/features/creditos/api/get-credito"
import { DatosCredito } from "@/features/creditos/components/datos-credito"
import { DesembolsoForm } from "@/features/creditos/components/desembolso-form"
import { DesembolsoResultado } from "@/features/creditos/components/desembolso-resultado"
import { PlanPagosCard } from "@/features/creditos/components/plan-pagos-card"
import { EstadoBadge } from "@/features/solicitudes/components/estado-badge"
import { getErrorMessage } from "@/lib/api-client"
import { formatDateTime } from "@/lib/format"

export const Route = createFileRoute("/_auth/creditos/$creditoId")({
  params: {
    parse: ({ creditoId }) => ({
      creditoId: z.coerce.number().int().positive().parse(creditoId),
    }),
    stringify: ({ creditoId }) => ({ creditoId: String(creditoId) }),
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(creditoQueryOptions(params.creditoId)),
  component: CreditoPage,
  errorComponent: ({ error }) => (
    <Pagina>
      <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
    </Pagina>
  ),
})

function CreditoPage() {
  const { creditoId } = Route.useParams()
  const { data: credito } = useSuspenseQuery(creditoQueryOptions(creditoId))
  const desembolsado = credito.estado === "Desembolsada"

  return (
    <Pagina>
      <PageHeader
        title={`Crédito ${credito.numeroCredito}`}
        badge={<EstadoBadge estado={credito.estado} />}
        description={
          <>
            Aprobado el {formatDateTime(credito.fechaCreacion)} ·{" "}
            <Link
              to="/solicitudes/$solicitudId"
              params={{ solicitudId: credito.solicitudId }}
              className="underline-offset-4 hover:underline"
            >
              Solicitud #{credito.solicitudId}
            </Link>
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <DatosCredito credito={credito} className="lg:col-span-3" />
        {desembolsado ? (
          <DesembolsoResultado credito={credito} className="lg:col-span-2" />
        ) : (
          <DesembolsoForm credito={credito} className="lg:col-span-2" />
        )}
      </div>

      {/* La pantalla de desembolso debe ser limpia: el plan se muestra una vez desembolsado,
          cuando sus vencimientos ya son definitivos. */}
      {desembolsado && <PlanPagosCard creditoId={credito.id} desembolsado />}
    </Pagina>
  )
}

/** Contenedor de la pantalla con el enlace de regreso a la lista. */
function Pagina({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link to="/creditos" />}
      >
        <ArrowLeftIcon />
        Créditos
      </Button>
      {children}
    </div>
  )
}
