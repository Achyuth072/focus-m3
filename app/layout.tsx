import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import QueryProvider from "@/components/QueryProvider";
import { TimerProvider } from "@/components/TimerProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppShell from "@/components/layout/AppShell";
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
              </TimerProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster
          position="bottom-center"
          expand={true}
          duration={4000}
          swipeDirections={["bottom"]}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "bg-card border border-border text-foreground rounded-lg p-4 shadow-none flex items-center justify-start gap-4 w-[90vw] sm:w-fit sm:max-w-[420px] mb-[calc(76px+env(safe-area-inset-bottom))] md:mb-0 text-left",
              success: "",
              content:
                "flex min-w-0 flex-col items-start gap-0.5 text-left order-1",
              icon: "shrink-0 order-2",
              title: "font-medium text-sm leading-tight text-left",
              description: "text-sm text-muted-foreground text-left",
              actionButton:
                "bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90 shrink-0",
              cancelButton:
                "bg-transparent border border-border text-muted-foreground px-3 py-1.5 rounded-md text-sm hover:bg-accent shrink-0",
            },
          }}
        />
      </body>
    </html>
  );
}
