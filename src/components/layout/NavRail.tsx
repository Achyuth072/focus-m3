'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Typography, Divider } from '@mui/material';

import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

const mainNavItems = [
  { label: 'Tasks', icon: <ChecklistRoundedIcon />, path: '/' },
  { label: 'Calendar', icon: <CalendarMonthRoundedIcon />, path: '/calendar' },
  { label: 'Stats', icon: <BarChartRoundedIcon />, path: '/stats' },
];

const secondaryNavItems = [
  { label: 'Focus', icon: <TimerRoundedIcon />, path: '/focus' },
  { label: 'Settings', icon: <SettingsRoundedIcon />, path: '/settings' },
];

const COLLAPSED_WIDTH = 80;
const EXPANDED_WIDTH = 280;

export default function NavRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // Prefetch all routes on mount for instant navigation
  useEffect(() => {
    const allRoutes = [...mainNavItems, ...secondaryNavItems].map((item) => item.path);
    allRoutes.forEach((path) => router.prefetch(path));
  }, [router]);

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

      {/* Main Navigation Items */}
      {mainNavItems.map((item) => {
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
              py: 2,
              borderRadius: '28px',
              cursor: 'pointer',
              bgcolor: isActive ? 'rgba(208, 188, 255, 0.12)' : 'transparent',
              color: isActive ? 'primary.main' : 'text.secondary',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: isActive
                  ? 'rgba(208, 188, 255, 0.16)'
                  : 'rgba(208, 188, 255, 0.08)',
              },
              '&:active': {
                transform: 'scale(0.96)',
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

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Divider */}
      <Divider sx={{ mx: 2, my: 1 }} />

      {/* Secondary Navigation Items */}
      {secondaryNavItems.map((item) => {
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
              py: 2,
              borderRadius: '28px',
              cursor: 'pointer',
              bgcolor: isActive ? 'rgba(208, 188, 255, 0.12)' : 'transparent',
              color: isActive ? 'primary.main' : 'text.secondary',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: isActive
                  ? 'rgba(208, 188, 255, 0.16)'
                  : 'rgba(208, 188, 255, 0.08)',
              },
              '&:active': {
                transform: 'scale(0.96)',
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
