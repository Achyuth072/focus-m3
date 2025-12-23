'use client';

import { Box, Typography, IconButton } from '@mui/material';
import { format } from 'date-fns';
import { useCalendarStore } from '@/lib/store/calendarStore';

export default function CalendarTodayIcon() {
  const { today } = useCalendarStore();
  const currentDate = new Date();
  const dayNumber = format(currentDate, 'd');

  return (
    <IconButton
      onClick={today}
      sx={{
        width: 34,
        height: 34,
        borderRadius: '10px',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        p: 0,
        '&:hover': {
          bgcolor: 'primary.dark',
        },
      }}
    >
      {/* Calendar Top Bar */}
      <Box
        sx={{
          width: '100%',
          height: 8,
          bgcolor: 'rgba(0,0,0,0.2)',
          borderRadius: '10px 10px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            bgcolor: 'primary.contrastText',
            mx: 0.25,
          }}
        />
        <Box
          sx={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            bgcolor: 'primary.contrastText',
            mx: 0.25,
          }}
        />
      </Box>
      {/* Date Number */}
      <Typography
        sx={{
          fontSize: '0.85rem',
          fontWeight: 700,
          lineHeight: 1,
          mt: 0.2,
        }}
      >
        {dayNumber}
      </Typography>
    </IconButton>
  );
}
