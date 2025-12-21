'use client';

import { Box, Typography, Button, AppBar, Toolbar } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { fadeIn } from '@/theme/motion';

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
            FocusM3
          </Typography>
          <Button color="inherit" onClick={signOut}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>

      <motion.div {...fadeIn}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 64px)',
            p: 3,
            gap: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 400 }}>
            Hello, {user.email}
          </Typography>
          <Typography color="text.secondary">
            Welcome to FocusM3. Your foundation is ready!
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}
