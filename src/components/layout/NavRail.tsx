'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';

const TasksIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
  </svg>
);

const FocusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z" />
  </svg>
);

const navItems = [
  { label: 'Tasks', icon: <TasksIcon />, path: '/' },
  { label: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
  { label: 'Focus', icon: <FocusIcon />, path: '/focus' },
];

const COLLAPSED_WIDTH = 80;
const EXPANDED_WIDTH = 280;

export default function NavRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Box
      component="nav"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        py: 3,
        gap: 0.5,
        zIndex: 1100,
        borderRight: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Logo / Title */}
      <Box
        sx={{
          px: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          minHeight: 48,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ color: 'primary.contrastText', fontWeight: 600 }}>
            F
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            opacity: isExpanded ? 1 : 0,
            transition: 'opacity 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          FocusM3
        </Typography>
      </Box>

      {/* Navigation Items */}
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Box
            key={item.label}
            onClick={() => router.push(item.path)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mx: 1.5,
              px: 1.5,
              py: 1.5,
              borderRadius: 3,
              cursor: 'pointer',
              bgcolor: isActive ? 'rgba(208, 188, 255, 0.12)' : 'transparent',
              color: isActive ? 'primary.main' : 'text.secondary',
              transition: 'background-color 0.15s ease, color 0.15s ease',
              '&:hover': {
                bgcolor: isActive
                  ? 'rgba(208, 188, 255, 0.16)'
                  : 'rgba(208, 188, 255, 0.08)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            <Box sx={{ flexShrink: 0, display: 'flex' }}>{item.icon}</Box>
            <Typography
              sx={{
                opacity: isExpanded ? 1 : 0,
                transition: 'opacity 0.2s ease',
                whiteSpace: 'nowrap',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
