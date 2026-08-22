"use client";

import { MotionConfig } from "motion/react";
import {
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps,
} from "next-themes";

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={{ type: "application/json" }}
      {...props}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemeProvider>
  );
};

export { ThemeProvider };
