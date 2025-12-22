'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { motion } from 'framer-motion';

// Simple SVG icons to avoid additional dependencies
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

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(0);

  useEffect(() => {
    const index = navItems.findIndex((item) => item.path === pathname);
    if (index !== -1) setValue(index);
  }, [pathname]);

  return (
    <Paper
      component={motion.div}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: '28px 28px 0 0',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
      elevation={0}
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => {
          setValue(newValue);
          router.push(navItems[newValue].path);
        }}
        sx={{
          height: 80,
          bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            minWidth: 80,
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '12px',
            fontWeight: 500,
            mt: 0.5,
            '&.Mui-selected': {
              fontSize: '12px',
            },
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={
              <motion.div
                whileTap={{ scale: 0.9 }}
                style={{
                  padding: '4px 20px',
                  borderRadius: '16px',
                  backgroundColor:
                    navItems[value].label === item.label
                      ? 'rgba(208, 188, 255, 0.12)'
                      : 'transparent',
                }}
              >
                {item.icon}
              </motion.div>
            }
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
