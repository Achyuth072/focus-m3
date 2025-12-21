'use client';

import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { slideUp } from '@/theme/motion';

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        gap: 3,
      }}
    >
      <motion.div {...slideUp}>
        <Typography variant="h4" sx={{ fontWeight: 500, textAlign: 'center' }}>
          Private Access Only
        </Typography>
        <Typography 
          color="text.secondary" 
          sx={{ mt: 2, textAlign: 'center', maxWidth: 400 }}
        >
          This app is for personal use only. If you believe you should have access, 
          contact the owner.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/login')}
          >
            Back to Login
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
}
