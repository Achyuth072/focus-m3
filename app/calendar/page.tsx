'use client';

import { useState } from 'react';
import { Box, useMediaQuery, useTheme, ToggleButton, ToggleButtonGroup, IconButton, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { fadeIn } from '@/theme/motion';
import { useCalendarStore } from '@/lib/store/calendarStore';
import { useTasks } from '@/lib/hooks/useTasks';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import CalendarTodayIcon from '@/components/calendar/CalendarTodayIcon';
import MiniCalendar from '@/components/calendar/MiniCalendar';
import TaskSheet from '@/components/tasks/TaskSheet';
import type { Task } from '@/lib/types/task';
import { format } from 'date-fns';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

export default function CalendarPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: tasks = [] } = useTasks();
  const calendarStore = useCalendarStore();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [createTaskDate, setCreateTaskDate] = useState<Date | null>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null);

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
  };

  const handleTitleClick = (event: React.MouseEvent<HTMLElement>) => {
    setCalendarAnchor(event.currentTarget);
  };

  const handleMiniCalendarClose = () => {
    setCalendarAnchor(null);
  };

  const handleDateSelect = (date: Date) => {
    calendarStore.setCurrentDate(date);
  };

  const handleDayClick = (date: Date) => {
    setCreateTaskDate(date);
  };

  // View Toggle Component (shared)
  const ViewToggle = (
    <ToggleButtonGroup
      value={calendarStore.view}
      exclusive
      onChange={(_, newView) => newView && calendarStore.setView(newView)}
      size="small"
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '28px',
        p: 0.5,
        '& .MuiToggleButton-root': {
          borderRadius: '24px',
          border: 'none',
          px: { xs: 1.5, md: 2 },
          py: 0.5,
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'none',
          whiteSpace: 'nowrap',
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          },
        },
      }}
    >
      <ToggleButton value="3day">3 Day</ToggleButton>
      <ToggleButton value="week">Week</ToggleButton>
      <ToggleButton value="month">Month</ToggleButton>
    </ToggleButtonGroup>
  );

  // Arrow Controls Component (shared)
  const ArrowControls = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
      <IconButton
        onClick={calendarStore.prev}
        size="small"
        sx={{ borderRadius: '28px' }}
      >
        <ChevronLeftRoundedIcon />
      </IconButton>
      <IconButton
        onClick={calendarStore.next}
        size="small"
        sx={{ borderRadius: '28px' }}
      >
        <ChevronRightRoundedIcon />
      </IconButton>
    </Box>
  );

  return (
    <motion.div {...fadeIn} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 32px)',
          bgcolor: 'background.default',
          overflow: 'hidden',
          overscrollBehavior: 'none',
        }}
      >
        {/* Desktop Header */}
        {!isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 2,
            }}
          >
            {/* Left: Title */}
            <Button
              onClick={handleTitleClick}
              endIcon={<ExpandMoreRoundedIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.25rem',
                color: 'text.primary',
                px: 1.5,
                borderRadius: '28px',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {format(calendarStore.currentDate, 'MMMM yyyy')}
            </Button>

            {/* Right: Today, Arrows, View Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                onClick={calendarStore.today}
                sx={{
                  borderRadius: '28px',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                Today
              </Button>
              {ArrowControls}
              {ViewToggle}
            </Box>
          </Box>
        )}

        {/* Mobile Controls */}
        {isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
            }}
          >
            {/* Left: Arrows */}
            {ArrowControls}

            {/* Right: View Toggle + Today Icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {ViewToggle}
              <CalendarTodayIcon />
            </Box>
          </Box>
        )}

        {/* Calendar Grid */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <CalendarGrid
            days={calendarStore.days}
            tasks={tasks}
            view={calendarStore.view}
            isToday={calendarStore.isToday}
            isCurrentMonth={calendarStore.isCurrentMonth}
            onTaskClick={handleTaskClick}
            onDayClick={handleDayClick}
          />
        </Box>
      </Box>

      {/* Task Edit Sheet */}
      <TaskSheet
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        initialTask={editingTask}
      />

      {/* Task Create Sheet (from calendar day click) */}
      <TaskSheet
        open={!!createTaskDate}
        onClose={() => setCreateTaskDate(null)}
        initialDate={createTaskDate}
      />

      {/* Desktop Mini Calendar Popover */}
      <MiniCalendar
        anchorEl={calendarAnchor}
        open={Boolean(calendarAnchor)}
        onClose={handleMiniCalendarClose}
        currentDate={calendarStore.currentDate}
        onDateSelect={handleDateSelect}
      />
    </motion.div>
  );
}
