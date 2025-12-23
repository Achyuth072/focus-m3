'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Popover,
  Button,
} from '@mui/material';
import {
  ChevronLeftRounded as ChevronLeftRoundedIcon,
  ChevronRightRounded as ChevronRightRoundedIcon,
} from '@mui/icons-material';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addYears,
  subYears,
  isSameYear,
} from 'date-fns';

interface MiniCalendarProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  currentDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function MiniCalendar({
  anchorEl,
  open,
  onClose,
  currentDate,
  onDateSelect,
}: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState(currentDate);
  const [isYearView, setIsYearView] = useState(false);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate));
    const end = endOfWeek(endOfMonth(viewDate));
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const handlePrev = () => {
    if (isYearView) {
      setViewDate(subYears(viewDate, 1));
    } else {
      setViewDate(subMonths(viewDate, 1));
    }
  };

  const handleNext = () => {
    if (isYearView) {
      setViewDate(addYears(viewDate, 1));
    } else {
      setViewDate(addMonths(viewDate, 1));
    }
  };

  const handleTitleClick = () => {
    setIsYearView(!isYearView);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(monthIndex);
    setViewDate(newDate);
    setIsYearView(false);
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    onClose();
  };

  const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '28px',
            p: 2,
            minWidth: 300,
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={handlePrev} size="small" sx={{ borderRadius: '28px' }}>
          <ChevronLeftRoundedIcon />
        </IconButton>
        <Button
          onClick={handleTitleClick}
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            color: 'text.primary',
            textTransform: 'none',
            borderRadius: '12px',
          }}
        >
          {isYearView ? format(viewDate, 'yyyy') : format(viewDate, 'MMMM yyyy')}
        </Button>
        <IconButton onClick={handleNext} size="small" sx={{ borderRadius: '28px' }}>
          <ChevronRightRoundedIcon />
        </IconButton>
      </Box>

      {/* Year View (Month Grid) */}
      {isYearView ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {MONTHS.map((month, index) => {
            const isSelected = index === viewDate.getMonth();
            return (
              <Button
                key={month}
                onClick={() => handleMonthSelect(index)}
                sx={{
                  borderRadius: '16px',
                  py: 1,
                  color: isSelected ? 'primary.contrastText' : 'text.primary',
                  bgcolor: isSelected ? 'primary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                {month}
              </Button>
            );
          })}
        </Box>
      ) : (
        <>
          {/* Day Names */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <Typography
                key={i}
                variant="caption"
                sx={{
                  textAlign: 'center',
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
              >
                {day}
              </Typography>
            ))}
          </Box>

          {/* Day Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
            {days.map((date) => {
              const isSelected = isSameDay(date, currentDate);
              const isToday = isSameDay(date, new Date());
              const isCurrentMonth = isSameMonth(date, viewDate);

              return (
                <Box
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    bgcolor: isSelected
                      ? 'primary.main'
                      : isToday
                      ? 'rgba(208, 188, 255, 0.2)'
                      : 'transparent',
                    border: isToday && !isSelected ? '1px solid' : 'none',
                    borderColor: 'primary.main',
                    opacity: isCurrentMonth ? 1 : 0.4,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: isSelected || isToday ? 600 : 400,
                      color: isSelected ? 'primary.contrastText' : 'text.primary',
                    }}
                  >
                    {format(date, 'd')}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Popover>
  );
}
