'use client';

import { Box, Typography } from '@mui/material';
import { format, isSameDay } from 'date-fns';
import type { Task } from '@/lib/types/task';
import type { CalendarView } from '@/lib/hooks/useCalendar';

const PRIORITY_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#F2B8B5', text: '#601410' },
  2: { bg: '#FFB74D', text: '#4E2600' },
  3: { bg: '#81C784', text: '#1B3B1A' },
  4: { bg: 'rgba(208, 188, 255, 0.3)', text: '#E6E0E9' },
};

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  view: CalendarView;
  isToday: boolean;
  isCurrentMonth: boolean;
  onTaskClick?: (task: Task) => void;
}

export default function CalendarDay({
  date,
  tasks,
  view,
  isToday,
  isCurrentMonth,
  onTaskClick,
}: CalendarDayProps) {
  const dayTasks = tasks.filter(
    (task) => task.due_date && isSameDay(new Date(task.due_date), date)
  );

  const isMonthView = view === 'month';

  return (
    <Box
      sx={{
        minHeight: isMonthView ? { xs: 60, md: 100 } : { xs: 120, md: 140 },
        flex: isMonthView ? 'none' : 1,
        p: isMonthView ? 0.5 : 1,
        bgcolor: isMonthView 
          ? (isToday ? 'rgba(208, 188, 255, 0.08)' : 'background.paper')
          : 'background.paper',
        borderRadius: isMonthView ? '12px' : '0 0 16px 16px',
        border: isToday && isMonthView ? '2px solid' : 'none',
        borderColor: 'primary.main',
        opacity: isCurrentMonth ? 1 : 0.4,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        overflow: 'hidden',
      }}
    >
      {/* Date Header (Month View Only) */}
      {isMonthView && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            sx={{
              fontWeight: isToday ? 700 : 500,
              fontSize: '0.875rem',
              minWidth: isToday ? 28 : 'auto',
              minHeight: isToday ? 28 : 'auto',
              borderRadius: '50%',
              bgcolor: isToday ? 'primary.main' : 'transparent',
              color: isToday ? 'primary.contrastText' : 'text.primary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {format(date, 'd')}
          </Typography>
        </Box>
      )}

      {/* Tasks */}
      <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {isMonthView ? (
          // Month view: Show dots
          dayTasks.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {dayTasks.slice(0, 3).map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: PRIORITY_COLORS[task.priority].bg,
                  }}
                />
              ))}
              {dayTasks.length > 3 && (
                <Typography variant="caption" sx={{ fontSize: '10px', opacity: 0.6 }}>
                  +{dayTasks.length - 3}
                </Typography>
              )}
            </Box>
          )
        ) : (
          // Week/3-Day: Show solid event blocks (Google Calendar style)
          dayTasks.map((task) => (
            <Box
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              sx={{
                py: 0.75,
                px: 1,
                borderRadius: '8px',
                bgcolor: PRIORITY_COLORS[task.priority].bg,
                color: PRIORITY_COLORS[task.priority].text,
                cursor: 'pointer',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {task.content}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
