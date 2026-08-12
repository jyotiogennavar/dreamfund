"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartColumn,
  LayoutDashboard,
  Settings,
  Target,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { analyticsPath, goalsPath, homePath, settingsPath } from "@/paths";

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
    <Sidebar
      className="top-14! h-[calc(100svh-3.5rem)]!"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className="text-[13px] tracking-wide [&_svg]:size-3.5"
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
