import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/roboto-flex';
import ThemeRegistry from '@/components/ThemeRegistry';
import { AuthProvider } from '@/components/AuthProvider';
import QueryProvider from '@/components/QueryProvider';
import AppShell from '@/components/layout/AppShell';

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
  themeColor: '#141218',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <QueryProvider>
            <AuthProvider>
              <AppShell>{children}</AppShell>
            </AuthProvider>
          </QueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}


