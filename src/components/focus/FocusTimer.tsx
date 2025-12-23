'use client';

import { Box, Typography, IconButton, LinearProgress, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTimer } from '@/lib/hooks/useFocusTimer';
import type { TimerMode } from '@/lib/types/timer';

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';

const MODE_CONFIG: Record<TimerMode, { label: string; color: string; bgColor: string }> = {
  focus: { label: 'Focus', color: '#D0BCFF', bgColor: 'rgba(208, 188, 255, 0.12)' },
  shortBreak: { label: 'Short Break', color: '#81C784', bgColor: 'rgba(129, 199, 132, 0.12)' },
  longBreak: { label: 'Long Break', color: '#64B5F6', bgColor: 'rgba(100, 181, 246, 0.12)' },
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface FocusTimerProps {
  taskId?: string;
  taskTitle?: string;
  onClose?: () => void;
}

export default function FocusTimer({ taskId, taskTitle, onClose }: FocusTimerProps) {
  const { state, settings, start, pause, stop, skip } = useFocusTimer();
  const modeConfig = MODE_CONFIG[state.mode];

  const totalSeconds =
    state.mode === 'focus'
      ? settings.focusDuration * 60
      : state.mode === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;

  const progress = ((totalSeconds - state.remainingSeconds) / totalSeconds) * 100;

  const handlePlayPause = () => {
    if (state.isRunning) {
      pause();
    } else {
      start(taskId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          p: 3,
          borderRadius: '28px',
          bgcolor: modeConfig.bgColor,
          border: '1px solid',
          borderColor: modeConfig.color,
          textAlign: 'center',
          minWidth: 280,
        }}
      >
        {/* Mode Indicator */}
        <Chip
          label={modeConfig.label}
          size="small"
          sx={{
            mb: 2,
            bgcolor: modeConfig.color,
            color: '#000',
            fontWeight: 600,
          }}
        />

        {/* Task Title (if provided) */}
        {taskTitle && (
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {taskTitle}
          </Typography>
        )}

        {/* Timer Display */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 300,
            fontFamily: 'monospace',
            color: modeConfig.color,
            my: 2,
          }}
        >
          {formatTime(state.remainingSeconds)}
        </Typography>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            mb: 2,
            bgcolor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: modeConfig.color,
              borderRadius: 3,
            },
          }}
        />

        {/* Session Counter */}
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          Session {state.completedSessions + 1} of {settings.sessionsBeforeLongBreak}
        </Typography>

        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
          <IconButton
            onClick={stop}
            sx={{
              bgcolor: 'background.paper',
              width: 50,
              height: 50,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <StopRoundedIcon />
          </IconButton>

          <IconButton
            onClick={handlePlayPause}
            sx={{
              bgcolor: modeConfig.color,
              color: '#000',
              width: 64,
              height: 64,
              '&:hover': { bgcolor: modeConfig.color, opacity: 0.96 },
            }}
          >
            {state.isRunning ? <PauseRoundedIcon sx={{ fontSize: '32px' }} /> : <PlayArrowRoundedIcon sx={{ fontSize: '32px' }} />}
          </IconButton>

          <IconButton
            onClick={skip}
            sx={{
              bgcolor: 'background.paper',
              width: 50,
              height: 50,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <SkipNextRoundedIcon />
          </IconButton>
        </Box>
      </Box>
    </motion.div>
  );
}
