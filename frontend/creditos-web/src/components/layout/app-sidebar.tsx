import { Link } from "@tanstack/react-router"
import * as React from "react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  FileTextIcon,
  HandCoinsIcon,
  LandmarkIcon,
  UsersIcon,
} from "lucide-react"

const data = {
  // Orden de uso: primero la cartera de créditos, luego su origen y al final los clientes.
  navMain: [
    {
      title: "Créditos",
      url: "/creditos" as const,
      icon: <LandmarkIcon />,
    },
    {
      title: "Solicitudes de crédito",
      url: "/solicitudes" as const,
      icon: <FileTextIcon />,
    },
    {
      title: "Clientes",
      url: "/clientes" as const,
      icon: <UsersIcon />,
    },
  ],
}
export function AppSidebar({
  userName,
  ...props
}: React.ComponentProps<typeof Sidebar> & { userName: string }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HandCoinsIcon className="size-4" />
              </div>
              <span className="truncate text-base font-semibold">Créditos</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: userName }} />
      </SidebarFooter>
    </Sidebar>
  )
}
