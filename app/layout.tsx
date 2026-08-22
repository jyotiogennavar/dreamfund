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
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SidebarProvider className="flex flex-col">
              <AppHeader />
              <div className="flex min-h-0 flex-1">
                <AppSidebar />
                <SidebarInset className="rounded-2xl bg-canvas">
                  <main className="flex flex-1 flex-col gap-4 rounded-2xl bg-canvas p-4 md:p-6">
                    <Suspense fallback={<PageSpinner />}>{children}</Suspense>
                  </main>
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
