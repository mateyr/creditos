import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/")({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="px-4 py-6 lg:px-6">
      <h1 className="text-lg font-medium">Inicio</h1>
    </div>
  )
}
