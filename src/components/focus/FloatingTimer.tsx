'use client';

import { Box, Fab, Typography, IconButton, Collapse } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTimer } from '@/components/TimerProvider';
import FocusTimer from '@/components/focus/FocusTimer';
import type { TimerMode } from '@/lib/types/timer';

const ExpandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
  </svg>
);

const CollapseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
  </svg>
);

const MODE_COLORS: Record<TimerMode, string> = {
  focus: '#D0BCFF',
  shortBreak: '#81C784',
  longBreak: '#64B5F6',
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function FloatingTimer() {
  const { state, settings } = useTimer();
  const [expanded, setExpanded] = useState(false);

  // Only show if timer is active (running or has an active task)
  const shouldShow = state.isRunning || state.activeTaskId !== null;

  if (!shouldShow) return null;

  const modeColor = MODE_COLORS[state.mode];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 100,
        right: 16,
        zIndex: 1200,
      }}
    >
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={() => setExpanded(false)}
                size="small"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  zIndex: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <CollapseIcon />
              </IconButton>
              <FocusTimer />
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Fab
              variant="extended"
              onClick={() => setExpanded(true)}
              sx={{
                bgcolor: modeColor,
                color: '#000',
                fontWeight: 600,
                gap: 1,
                '&:hover': { bgcolor: modeColor, opacity: 0.9 },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
                {formatTime(state.remainingSeconds)}
              </Typography>
              <ExpandIcon />
            </Fab>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
