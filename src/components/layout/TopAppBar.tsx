'use client';

import { useState } from 'react';
import { Box, IconButton, Chip, Menu, MenuItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { useTimer } from '@/components/TimerProvider';
import { useCompletedTasks } from '@/components/CompletedTasksProvider';
import { useCalendarStore } from '@/lib/store/calendarStore';
import MiniCalendar from '@/components/calendar/MiniCalendar';
import type { TimerMode } from '@/lib/types/timer';
import { format } from 'date-fns';

import MenuIcon from '@mui/icons-material/MenuRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

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

interface TopAppBarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function TopAppBar({ onMenuClick, title = 'Today' }: TopAppBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, settings } = useTimer();
  const { toggleShowCompleted } = useCompletedTasks();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null);

  // Calendar Store
  const calendarStore = useCalendarStore();
  const isCalendarRoute = pathname === '/calendar';

  const isTimerActive = state.isRunning || state.activeTaskId !== null;
  const modeColor = MODE_COLORS[state.mode];

  const handleTimerClick = () => {
    router.push('/focus');
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleShowCompleted = () => {
    toggleShowCompleted();
    handleMenuClose();
  };

  const handleCalendarTitleClick = (event: React.MouseEvent<HTMLElement>) => {
    setCalendarAnchor(event.currentTarget);
  };

  const handleMiniCalendarClose = () => {
    setCalendarAnchor(null);
  };

  const handleDateSelect = (date: Date) => {
    calendarStore.setCurrentDate(date);
  };

  // Short format for Calendar title: "Dec 2025"
  const calendarTitle = format(calendarStore.currentDate, 'MMM yyyy');

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1,
        py: 1,
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        minHeight: 64,
      }}
    >
      {/* Left: Hamburger + Title */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onMenuClick} edge="start" sx={{ mr: 0.5 }}>
          <MenuIcon />
        </IconButton>
        {isCalendarRoute && (
          <Button
            onClick={handleCalendarTitleClick}
            endIcon={<ExpandMoreRoundedIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              color: 'text.primary',
              px: 1,
              borderRadius: '28px',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {calendarTitle}
          </Button>
        )}
      </Box>

      {/* Right: Timer + Menu */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Chip
          icon={<PlayArrowRoundedIcon sx={{ fontSize: '1rem !important' }} />}
          label={isTimerActive ? formatTime(state.remainingSeconds) : formatTime(settings.focusDuration * 60)}
          onClick={handleTimerClick}
          sx={{
            px: 1,
            height: 36,
            fontWeight: 600,
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            bgcolor: isTimerActive ? modeColor : 'rgba(208, 188, 255, 0.12)',
            color: isTimerActive ? '#000' : 'primary.main',
            border: '2px solid',
            borderColor: modeColor,
            borderRadius: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '& .MuiChip-icon': {
              color: 'inherit',
              ml: 0.5,
            },
            '&:hover': {
              bgcolor: isTimerActive ? modeColor : 'rgba(208, 188, 255, 0.2)',
            },
          }}
        />
        <IconButton onClick={handleMoreClick}>
          <MoreVertRoundedIcon />
        </IconButton>
      </Box>

      {/* More Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: { borderRadius: '28px', mt: 1, minWidth: 220, boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }
          }
        }}
      >
        {/* Hide "Show Completed" on Calendar and Stats pages */}
        {!isCalendarRoute && pathname !== '/stats' && (
          <MenuItem onClick={handleShowCompleted} sx={{ borderRadius: '28px', mx: 0.5, py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <TaskAltRoundedIcon />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Show Completed Tasks</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Mini Calendar Popover */}
      <MiniCalendar
        anchorEl={calendarAnchor}
        open={Boolean(calendarAnchor)}
        onClose={handleMiniCalendarClose}
        currentDate={calendarStore.currentDate}
        onDateSelect={handleDateSelect}
      />
    </Box>
  );
}
