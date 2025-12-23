'use client';

import { Box, Typography, useTheme } from '@mui/material';
import { useFocusHistoryStore } from '@/lib/store/focusHistoryStore';
import { useTasks } from '@/lib/hooks/useTasks';
import { isToday, parseISO } from 'date-fns';

import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '28px',
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '16px',
          bgcolor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.contrastText',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function StatsOverview() {
  const theme = useTheme();
  const sessions = useFocusHistoryStore((state) => state.sessions);
  const { data: tasks = [] } = useTasks({ showCompleted: true });

  // Calculate today's stats
  const todaySessions = sessions.filter((s) =>
    isToday(parseISO(s.completedAt))
  );
  const todayFocusMinutes = Math.round(
    todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60
  );

  const todayCompleted = tasks.filter(
    (t) => t.is_completed && t.completed_at && isToday(parseISO(t.completed_at))
  ).length;

  // Simple streak calculation (consecutive days with focus)
  const streak = todaySessions.length > 0 ? 1 : 0; // Placeholder for now

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      <StatCard
        icon={<AccessTimeRoundedIcon />}
        label="Focus Today"
        value={`${todayFocusMinutes}m`}
        color={theme.palette.primary.main}
      />
      <StatCard
        icon={<CheckCircleRoundedIcon />}
        label="Tasks Done"
        value={String(todayCompleted)}
        color={theme.palette.secondary.main}
      />
      <StatCard
        icon={<LocalFireDepartmentRoundedIcon />}
        label="Streak"
        value={`${streak}d`}
        color={theme.palette.error.main}
      />
    </Box>
  );
}
