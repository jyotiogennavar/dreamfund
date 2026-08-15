import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppHeader } from "@/app/_navigation/app-header";
import { AppSidebar } from "@/app/_navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageSpinner } from "@/components/ui/spinner";

const merriweatherHeading = Merriweather({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dreamfund",
  description: "Track savings goals and watch your dreams take shape.",
};

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
        merriweatherHeading.variable,
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
                <SidebarInset>
                  <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <Suspense fallback={<PageSpinner />}>{children}</Suspense>
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
