import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/solicitudes")({
  component: SolicitudesPage,
})

function SolicitudesPage() {
  return (
    <div className="px-4 py-6 lg:px-6">
      <h1 className="text-lg font-medium">Solicitudes de crédito</h1>
    </div>
  )
}
