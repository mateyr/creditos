import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"
import { z } from "zod"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { solicitudQueryOptions } from "@/features/solicitudes/api/get-solicitud"
import { DatosSolicitud } from "@/features/solicitudes/components/datos-solicitud"
import { DictamenForm } from "@/features/solicitudes/components/dictamen-form"
import { DictamenResultado } from "@/features/solicitudes/components/dictamen-resultado"
import { EstadoBadge } from "@/features/solicitudes/components/estado-badge"
import { PlanPagosCard } from "@/features/solicitudes/components/plan-pagos-card"
import { getErrorMessage } from "@/lib/api-client"
import { formatDateTime } from "@/lib/format"

export const Route = createFileRoute("/_auth/solicitudes/$solicitudId")({
  params: {
    parse: ({ solicitudId }) => ({
      solicitudId: z.coerce.number().int().positive().parse(solicitudId),
    }),
    stringify: ({ solicitudId }) => ({ solicitudId: String(solicitudId) }),
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      solicitudQueryOptions(params.solicitudId)
    ),
  component: SolicitudPage,
  errorComponent: ({ error }) => (
    <Pagina>
      <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
    </Pagina>
  ),
})

function SolicitudPage() {
  const { solicitudId } = Route.useParams()
  const { data: solicitud } = useSuspenseQuery(
    solicitudQueryOptions(solicitudId)
  )

  return (
    <Pagina>
      <PageHeader
        title={`Solicitud #${solicitud.id}`}
        badge={<EstadoBadge estado={solicitud.estado} />}
        description={`Registrada el ${formatDateTime(solicitud.fechaCreacion)}`}
      />

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <DatosSolicitud solicitud={solicitud} className="lg:col-span-3" />
        {solicitud.estado === "Pendiente" ? (
          <DictamenForm solicitudId={solicitud.id} className="lg:col-span-2" />
        ) : (
          <DictamenResultado solicitud={solicitud} className="lg:col-span-2" />
        )}
      </div>

      {solicitud.numeroCredito && <PlanPagosCard solicitudId={solicitud.id} />}
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
        render={<Link to="/solicitudes" />}
      >
        <ArrowLeftIcon />
        Solicitudes de crédito
      </Button>
      {children}
    </div>
  )
}
