import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import QueryProvider from "@/components/QueryProvider";
import { TimerProvider } from "@/components/TimerProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppShell from "@/components/layout/AppShell";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kanso",
  description: "Your personal productivity super-app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kanso",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FCFCFA" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A1A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <TimerProvider>
                <AppShell>{children}</AppShell>
                <OfflineIndicator />
              </TimerProvider>
            </AuthProvider>
          </QueryProvider>
          <Toaster
            position="bottom-center"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "bg-card border border-border text-foreground rounded-lg p-4 shadow-none flex items-center justify-between gap-3 w-[90vw] sm:w-[420px] mb-[calc(76px+env(safe-area-inset-bottom))] md:mb-0",
                title: "font-medium text-sm",
                description: "text-sm text-muted-foreground",
                actionButton:
                  "bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90 shrink-0",
                cancelButton:
                  "bg-transparent border border-border text-muted-foreground px-3 py-1.5 rounded-md text-sm hover:bg-accent shrink-0",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
