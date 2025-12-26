'use client';

import dynamic from 'next/dynamic';
import { Box, Typography, Skeleton, Card } from '@mui/material';
import { motion } from 'framer-motion';
import { fadeIn } from '@/theme/motion';
import StatsOverview from '@/components/stats/StatsOverview';

// Lazy load heavy chart components
const FocusChart = dynamic(() => import('@/components/stats/FocusChart'), {
  loading: () => (
    <Card sx={{ p: 3, height: 300, borderRadius: { xs: '28px', md: '16px' } }}>
      <Skeleton variant="text" width="40%" height={32} />
      <Skeleton variant="rectangular" height={220} sx={{ mt: 2, borderRadius: 2 }} />
    </Card>
  ),
  ssr: false,
});

const TaskVelocityChart = dynamic(() => import('@/components/stats/TaskVelocityChart'), {
  loading: () => (
    <Card sx={{ p: 3, height: 300, borderRadius: { xs: '28px', md: '16px' } }}>
      <Skeleton variant="text" width="40%" height={32} />
      <Skeleton variant="rectangular" height={220} sx={{ mt: 2, borderRadius: 2 }} />
    </Card>
  ),
  ssr: false,
});

export default function StatsPage() {

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
