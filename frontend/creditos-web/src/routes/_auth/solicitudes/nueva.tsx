import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/page-header"
import { SolicitudForm } from "@/features/solicitudes/components/solicitud-form"

export const Route = createFileRoute("/_auth/solicitudes/nueva")({
  component: NuevaSolicitudPage,
})

function NuevaSolicitudPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <PageHeader
        title="Nueva solicitud de crédito"
        description="Captura del expediente: cliente, información laboral y condiciones del crédito."
      />
      <SolicitudForm />
    </div>
  )
}
