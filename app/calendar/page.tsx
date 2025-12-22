'use client';

import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { fadeIn } from '@/theme/motion';

export default function CalendarPage() {
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
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
          </svg>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 400 }}>
          Calendar
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          Coming in Phase 3
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 300 }}>
          Visualize your tasks on a calendar, drag-and-drop to reschedule, and plan your week.
        </Typography>
      </Box>
    </motion.div>
  );
}
