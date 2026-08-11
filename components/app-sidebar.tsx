"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartColumn,
  HandCoins,
  LayoutDashboard,
  Settings,
  Target,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { analyticsPath, goalsPath, homePath, settingsPath } from "@/path";

const navItems = [
  {
    title: "Dashboard",
    href: homePath(),
    icon: LayoutDashboard,
    isActive: (pathname: string) => pathname === homePath(),
  },
  {
    title: "Goals",
    href: goalsPath(),
    icon: Target,
    isActive: (pathname: string) => pathname.startsWith(goalsPath()),
  },
  {
    title: "Analytics",
    href: analyticsPath(),
    icon: ChartColumn,
    isActive: (pathname: string) => pathname.startsWith(analyticsPath()),
  },
  {
    title: "Settings",
    href: settingsPath(),
    icon: Settings,
    isActive: (pathname: string) => pathname.startsWith(settingsPath()),
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="font-serif">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border p-0 px-2">
        {/* logo */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="Dreamfund"
            >
              <Link href={homePath()}>
                <HandCoins className="size-4" />
                <span className="text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                  Dreamfund
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive(pathname)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
