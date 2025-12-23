'use client';

import { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import BottomNav from './BottomNav';
import NavRail from './NavRail';
import TopAppBar from './TopAppBar';
import NavDrawer from './NavDrawer';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { CompletedTasksProvider } from '@/components/CompletedTasksProvider';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const isImmersive = pathname === '/focus' || pathname === '/settings';
  const { user, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Don't render shell for unauthenticated users
  if (loading || !user) {
    return <>{children}</>;
  }

  return (
    <CompletedTasksProvider>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {/* Desktop: NavRail on the left */}
        {!isMobile && !isImmersive && <NavRail />}

        {/* Mobile: TopAppBar + Drawer */}
        {isMobile && !isImmersive && (
          <>
            <TopAppBar onMenuClick={() => setDrawerOpen(true)} />
            <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          </>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pb: isMobile && !isImmersive ? '96px' : 0,
            pl: isMobile || isImmersive ? 0 : '80px',
            minHeight: isMobile ? 'auto' : '100vh',
          }}
        >
          {children}
        </Box>

        {isMobile && !isImmersive && <BottomNav />}
      </Box>
    </CompletedTasksProvider>
  );
}
