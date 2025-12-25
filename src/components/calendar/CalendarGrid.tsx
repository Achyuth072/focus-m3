'use client';

import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import CalendarDay from './CalendarDay';
import type { Task } from '@/lib/types/task';
import type { CalendarView } from '@/lib/hooks/useCalendar';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarGridProps {
  days: Date[];
  tasks: Task[];
  view: CalendarView;
  isToday: (date: Date) => boolean;
  isCurrentMonth: (date: Date) => boolean;
  onTaskClick?: (task: Task) => void;
  onDayClick?: (date: Date) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export default function CalendarGrid({
  days,
  tasks,
  view,
  isToday,
  isCurrentMonth,
  onTaskClick,
  onDayClick,
  onSwipeLeft,
  onSwipeRight,
}: CalendarGridProps) {
  const columns = view === '3day' ? 3 : 7;

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        px: { xs: 1, md: 2 },
        pb: 2,
      }}
    >
      {/* Day Headers */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 1,
          mb: 1,
        }}
      >
        {(view === 'month' ? DAY_NAMES : days).map((day, index) => {
          const dateObj = day instanceof Date ? day : null;
          const isTodayDate = dateObj ? isToday(dateObj) : false;
          return (
            <Box
              key={index}
              sx={{
                textAlign: 'center',
                py: 1.5,
                bgcolor: 'background.paper',
                borderRadius: '16px 16px 0 0',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: view === 'month' ? '0.75rem' : '0.875rem',
                  color: 'text.secondary',
                }}
              >
                {dateObj ? format(dateObj, 'EEE') : (day as string)}
              </Typography>
              {view !== 'month' && dateObj && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: view === '3day' ? 40 : 32,
                    height: view === '3day' ? 40 : 32,
                    borderRadius: '50%',
                    bgcolor: isTodayDate ? 'primary.main' : 'transparent',
                    mt: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: view === '3day' ? '1.5rem' : '1.125rem',
                      color: isTodayDate ? 'primary.contrastText' : 'text.primary',
                    }}
                  >
                    {format(dateObj, 'd')}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Day Grid - Crossfade between views */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: 1,
              overflowY: view === 'month' ? 'hidden' : 'auto',
              minHeight: 0,
            }}
          >
            {days.map((date) => (
              <CalendarDay
                key={date.toISOString()}
                date={date}
                tasks={tasks}
                view={view}
                isToday={isToday(date)}
                isCurrentMonth={isCurrentMonth(date)}
                onTaskClick={onTaskClick}
                onDayClick={onDayClick}
              />
            ))}
          </Box>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
