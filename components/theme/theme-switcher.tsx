"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const iconEnter = {
  opacity: 1,
  scale: 1,
  filter: "blur(0px)",
};

const iconHidden = {
  opacity: 0,
  scale: 0.25,
  filter: "blur(4px)",
};

const ThemeSwitcher = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isDark = resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = mounted ? `Switch to ${nextTheme} theme` : "Switch theme";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={mounted ? () => setTheme(nextTheme) : undefined}
      aria-label={label}
      aria-disabled={!mounted}
    >
      <span className="relative flex size-4 items-center justify-center">
        {mounted ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? "sun" : "moon"}
              className="absolute inset-0 flex items-center justify-center"
              initial={shouldReduceMotion ? iconEnter : iconHidden}
              animate={iconEnter}
              exit={shouldReduceMotion ? iconEnter : iconHidden}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {isDark ? (
                <SunIcon className="size-4" />
              ) : (
                <MoonIcon className="size-4" />
              )}
            </motion.span>
          </AnimatePresence>
        ) : (
          <MoonIcon className="size-4" />
        )}
      </span>
      <span className="sr-only">{label}</span>
    </Button>
  );
};

export { ThemeSwitcher };
