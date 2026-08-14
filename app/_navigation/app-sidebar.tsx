"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartColumn,
  LayoutDashboard,
  Settings,
  Target,
} from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useHasPainted } from "@/hooks/use-has-painted";
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

const ICON_ONLY_QUERY = "(max-width: 63.999rem)";

const sidebarTransition = { type: "spring", duration: 0.35, bounce: 0 } as const;

const labelVariants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
};

function subscribeToIconOnlyViewport(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(ICON_ONLY_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function useIsIconOnlyViewport() {
  return useSyncExternalStore(
    subscribeToIconOnlyViewport,
    () => window.matchMedia(ICON_ONLY_QUERY).matches,
    () => false,
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpen, state } = useSidebar();
  const isIconOnlyViewport = useIsIconOnlyViewport();
  const hasPainted = useHasPainted();
  const isExpanded = state === "expanded";
  const showLabels = hasPainted ? isExpanded : !isIconOnlyViewport;

  useLayoutEffect(() => {
    setOpen(!isIconOnlyViewport);
  }, [isIconOnlyViewport, setOpen]);

  return (
    <MotionConfig transition={sidebarTransition} reducedMotion="user">
      <Sidebar
        collapsible="icon"
        className="top-14! h-[calc(100svh-3.5rem)]!"
      >
        <SidebarContent>
          <SidebarGroup className="mt-4">
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
                        <AnimatePresence initial={false} mode="popLayout">
                          {showLabels ? (
                            <motion.span
                              key={item.title}
                              variants={labelVariants}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              className="whitespace-nowrap"
                            >
                              {item.title}
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </MotionConfig>
  );
}
