'use client';

import { Box, useMediaQuery, useTheme } from '@mui/material';
import BottomNav from './BottomNav';
import NavRail from './NavRail';
import { useAuth } from '@/components/AuthProvider';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, loading } = useAuth();

  // Don't render shell for unauthenticated users
  if (loading || !user) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {!isMobile && <NavRail />}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pb: isMobile ? '96px' : 0,
          pl: isMobile ? 0 : '80px',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>

      {isMobile && <BottomNav />}
    </Box>
  );
}
