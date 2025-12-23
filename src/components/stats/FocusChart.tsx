'use client';

import { Box, Typography, useTheme } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useFocusHistoryStore } from '@/lib/store/focusHistoryStore';
import { format, subDays, parseISO, startOfDay, isSameDay } from 'date-fns';

export default function FocusChart() {
  const theme = useTheme();
  const sessions = useFocusHistoryStore((state) => state.sessions);

  // Generate last 7 days of data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date);

    const dayMinutes = sessions
      .filter((s) => isSameDay(parseISO(s.completedAt), dayStart))
      .reduce((acc, s) => acc + s.duration / 60, 0);

    return {
      day: format(date, 'EEE'),
      minutes: Math.round(dayMinutes),
    };
  });

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '28px',
        p: 2.5,
        height: 300,
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '1rem',
          mb: 2,
        }}
      >
        Focus Activity
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: 'none',
              borderRadius: 16,
              boxShadow: theme.shadows[4],
            }}
            labelStyle={{ color: theme.palette.text.primary, fontWeight: 600 }}
            itemStyle={{ color: theme.palette.primary.main }}
            formatter={(value) => [`${value ?? 0}m`, 'Focus']}
          />
          <Bar
            dataKey="minutes"
            fill={theme.palette.primary.main}
            radius={[8, 8, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
