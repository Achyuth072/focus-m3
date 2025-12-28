import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import QueryProvider from '@/components/QueryProvider';
import { TimerProvider } from '@/components/TimerProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppShell from '@/components/layout/AppShell';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'FocusM3',
  description: 'Your personal productivity super-app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FocusM3',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
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
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}


