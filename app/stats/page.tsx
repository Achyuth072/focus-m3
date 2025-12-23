'use client';

import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { fadeIn } from '@/theme/motion';
import StatsOverview from '@/components/stats/StatsOverview';
import FocusChart from '@/components/stats/FocusChart';
import TaskVelocityChart from '@/components/stats/TaskVelocityChart';

export default function StatsPage() {
  const theme = useTheme();

  return (
    <motion.div {...fadeIn} style={{ height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          p: { xs: 2, md: 3 },
          pb: { xs: 10, md: 3 },
          overflow: 'auto',
          height: '100%',
        }}
      >
        {/* Header */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', md: '2rem' },
          }}
        >
          Your Insights
        </Typography>

        {/* Overview Cards */}
        <StatsOverview />

        {/* Charts */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          <FocusChart />
          <TaskVelocityChart />
        </Box>
      </Box>
    </motion.div>
  );
}
