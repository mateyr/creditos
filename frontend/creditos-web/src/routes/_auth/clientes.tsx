import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/clientes")({
  component: ClientesPage,
})

function ClientesPage() {
  return (
    <div className="px-4 py-6 lg:px-6">
      <h1 className="text-lg font-medium">Clientes</h1>
    </div>
  )
}
