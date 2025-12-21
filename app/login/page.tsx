'use client';

import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { slideUp } from '@/theme/motion';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <motion.div {...slideUp}>
        <Card
          sx={{
            maxWidth: 400,
            width: '100%',
            p: 2,
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
              FocusM3
            </Typography>
            <Typography color="text.secondary" textAlign="center">
              Your personal productivity super-app
            </Typography>

            {error && (
              <Typography color="error" variant="body2" textAlign="center">
                {error.includes('Signups not allowed') || error.includes('signup_disabled')
                  ? 'This app is private. Only authorized users can sign in.'
                  : 'Authentication failed. Please try again.'}
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              onClick={signInWithGoogle}
              sx={{
                width: '100%',
                py: 1.5,
                mt: 2,
              }}
            >
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
