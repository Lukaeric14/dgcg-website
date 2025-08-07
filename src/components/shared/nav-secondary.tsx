"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar"

export function NavSecondary({
  items,
  onSettingsClick,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
  onSettingsClick?: () => void
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild={item.title !== "Settings"}
                onClick={item.title === "Settings" ? onSettingsClick : undefined}
              >
                {item.title === "Settings" ? (
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <item.icon />
                    <span>{item.title}</span>
                  </button>
                ) : (
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
