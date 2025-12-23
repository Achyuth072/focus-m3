'use client';

import { Box, type SxProps, type Theme } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface MasonryGridProps {
  children: ReactNode;
  minItemWidth?: number;
  gap?: number;
  sx?: SxProps<Theme>;
}

/**
 * A responsive Masonry-style grid using CSS Grid.
 * 
 * Usage:
 * ```tsx
 * <MasonryGrid minItemWidth={180} gap={2}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 * </MasonryGrid>
 * ```
 */
export default function MasonryGrid({
  children,
  minItemWidth = 160,
  gap = 2,
  sx,
}: MasonryGridProps) {
  return (
    <Box
      component={motion.div}
      layout
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
        gap,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
