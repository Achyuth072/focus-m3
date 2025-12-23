'use client';

import { Box, IconButton, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import type { CalendarView } from '@/lib/hooks/useCalendar';

interface CalendarHeaderProps {
  title: string;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function CalendarHeader({
  title,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 3 },
        py: 2,
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      {/* Left: Nav Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={onPrev}
          sx={{
            borderRadius: '28px',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>
        <IconButton
          onClick={onNext}
          sx={{
            borderRadius: '28px',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <ChevronRightRoundedIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, ml: 1 }}>
          {title}
        </Typography>
      </Box>

      {/* Right: View Toggle + Today Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, newView) => newView && onViewChange(newView)}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            borderRadius: '28px',
            p: 0.5,
            '& .MuiToggleButton-root': {
              borderRadius: '24px',
              border: 'none',
              px: 2,
              py: 0.75,
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
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

        <IconButton
          onClick={onToday}
          sx={{
            borderRadius: '28px',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 600,
            px: 2,
            py: 1,
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          <TodayRoundedIcon sx={{ mr: 0.5 }} />
          <Typography component="span" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
            Today
          </Typography>
        </IconButton>
      </Box>
    </Box>
  );
}
