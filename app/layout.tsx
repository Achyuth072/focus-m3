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
  adjustFontFallback: true,
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
          mobileOffset={{ left: 8, right: 8, bottom: 8 }}
          swipeDirections={["bottom"]}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "bg-card/95 backdrop-blur-sm border border-border text-foreground rounded-lg sm:rounded-xl py-2 px-3 sm:py-3 sm:px-5 shadow-lg inline-flex flex-wrap sm:flex-nowrap items-center gap-x-2 gap-y-2 sm:gap-3 w-fit max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] mb-[calc(76px+env(safe-area-inset-bottom))] md:mb-5",
              icon: "shrink-0 [&>svg]:w-5 [&>svg]:h-5",
              content: "min-w-0 flex-1",
              title: `${inter.className} font-semibold text-[13px] sm:text-sm tracking-tight leading-[1.15]`,
              description: `${inter.className} text-[12px] sm:text-sm text-muted-foreground`,
              actionButton: `bg-primary text-primary-foreground h-8 px-2.5 sm:px-3 rounded-md font-semibold text-[12px] sm:text-sm tracking-tight hover:opacity-90 active:scale-[0.98] transition-all shrink-0 shadow-sm ml-auto sm:ml-0 whitespace-nowrap ${inter.className}`,
              cancelButton:
                "bg-transparent border border-border text-muted-foreground h-8 px-2.5 sm:px-3 rounded-md text-[12px] sm:text-sm hover:bg-accent shrink-0 ml-auto sm:ml-0 whitespace-nowrap",
            },
          }}
        />
      </body>
    </html>
  );
}
