import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppHeader } from "@/app/_navigation/app-header";
import { AppSidebar } from "@/app/_navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { PageSpinner } from "@/components/ui/spinner";

const manropeHeading = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dreamfund",
  description: "Track savings goals and watch your dreams take shape.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        inter.variable,
        manropeHeading.variable,
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <SidebarProvider className="flex flex-col">
              <AppHeader />
              <div className="flex min-h-0 flex-1">
                <AppSidebar />
                <SidebarInset
                  id="main-content"
                  className="overflow-hidden rounded-2xl bg-canvas"
                >
                  <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <Suspense fallback={<PageSpinner />}>{children}</Suspense>
                  </div>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
