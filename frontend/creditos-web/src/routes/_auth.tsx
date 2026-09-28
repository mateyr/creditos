import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
} from "@tanstack/react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { session, useSession } from "@/features/auth/session"

export const Route = createFileRoute("/_auth")({
  // Sin sesión no se entra a ninguna ruta hija; se guarda el destino para volver tras el login.
  beforeLoad: ({ location }) => {
    if (!session.get()) {
      throw redirect({ to: "/login", search: { redirect: location.href } })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  const currentSession = useSession()

  // La sesión puede terminar estando ya dentro (logout, token vencido o 401 de la API).
  if (!currentSession) {
    return <Navigate to="/login" />
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 60)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar userName={currentSession.userName} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
