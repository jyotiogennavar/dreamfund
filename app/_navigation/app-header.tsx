"use client";

import Link from "next/link";
import { Bell, HandCoins } from "lucide-react";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { homePath } from "@/paths";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Link
        href={homePath()}
        className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight"
      >
        <HandCoins className="size-4" />
        <span>Dreamfund</span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Avatar size="sm">
          <AvatarFallback>DU</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
