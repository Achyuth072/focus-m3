'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { CompletedTasksProvider } from '@/components/CompletedTasksProvider';
import { useRealtimeSync } from '@/lib/hooks/useRealtimeSync';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MobileNav } from '@/components/layout/MobileNav';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isImmersive = pathname === '/focus';
  const { user, loading } = useAuth();

  // Global realtime sync - stays alive during navigation
  useRealtimeSync();

  // Don't render shell for unauthenticated users
  if (loading || !user) {
    return <>{children}</>;
  }

  return (
    <CompletedTasksProvider>
      <SidebarProvider defaultOpen={true}>
        {/* Desktop Sidebar - hidden only on Focus page */}
        {!isImmersive && <AppSidebar />}
        
        {/* Main Content with proper inset */}
        <SidebarInset>
          <div className="flex-1 pb-20 md:pb-0">
            {children}
          </div>
        </SidebarInset>

        {/* Mobile Bottom Nav - hidden only on Focus page */}
        {!isImmersive && <MobileNav />}
      </SidebarProvider>
    </CompletedTasksProvider>
  );
}
