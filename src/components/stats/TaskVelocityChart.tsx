'use client';

import { Box, Typography, useTheme } from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useTasks } from '@/lib/hooks/useTasks';
import { format, subDays, parseISO, startOfDay, isSameDay } from 'date-fns';

export default function TaskVelocityChart() {
  const theme = useTheme();
  const { data: tasks = [] } = useTasks({ showCompleted: true });

  // Get all completed tasks
  const completedTasks = tasks.filter((t) => t.is_completed && t.completed_at);

  // Generate last 7 days of data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date);

    const count = completedTasks.filter(
      (t) => t.completed_at && isSameDay(parseISO(t.completed_at), dayStart)
    ).length;

    return {
      day: format(date, 'EEE'),
      tasks: count,
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
        Task Velocity
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8} />
              <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            itemStyle={{ color: theme.palette.secondary.main }}
            formatter={(value) => [`${value ?? 0}`, 'Tasks']}
          />
          <Area
            type="monotone"
            dataKey="tasks"
            stroke={theme.palette.secondary.main}
            strokeWidth={2}
            fill="url(#taskGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
