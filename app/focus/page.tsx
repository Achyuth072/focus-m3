'use client';

import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { fadeIn } from '@/theme/motion';

export default function FocusPage() {
  return (
    <motion.div {...fadeIn}>
      <Box
        sx={{
          minHeight: 'calc(100vh - 96px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z" />
          </svg>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 400 }}>
          Focus Mode
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          Coming in Phase 3
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 300 }}>
          A dedicated Zen interface with Pomodoro timer. Track your focus minutes and stay productive.
        </Typography>
      </Box>
    </motion.div>
  );
}
