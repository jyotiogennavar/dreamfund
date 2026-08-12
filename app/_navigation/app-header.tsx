"use client";

import Link from "next/link";
import { HandCoins } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Separator } from "@/components/ui/separator";
import { homePath } from "@/paths";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <Link
        href={homePath()}
        className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight"
      >
        <HandCoins className="size-4" />
        <span>Dreamfund</span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher />
        <Avatar size="sm">
          <AvatarImage src="https://github.com/shadcn.png" alt="Demo user" />
          <AvatarFallback>DU</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
