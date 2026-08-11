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
import {
  analyticsPath,
  goalsPath,
  homePath,
  settingsPath,
} from "@/path";

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
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="Dreamfund"
              className="font-heading"
            >
              <Link href={homePath()}>
                <HandCoins className="size-4" />
                <span className="text-base font-semibold tracking-tight">
                  Dreamfund
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
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
