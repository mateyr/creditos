import { Link } from "@tanstack/react-router"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { FileTextIcon, HandCoinsIcon, UsersIcon } from "lucide-react"

const data = {
  user: {
    name: "admin",
  },
  navMain: [
    {
      title: "Clientes",
      url: "/clientes" as const,
      icon: <UsersIcon />,
    },
    {
      title: "Solicitudes de crédito",
      url: "/solicitudes" as const,
      icon: <FileTextIcon />,
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
