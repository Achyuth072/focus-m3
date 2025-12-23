'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { motion } from 'framer-motion';

import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

const navItems = [
  { label: 'Tasks', icon: <ChecklistRoundedIcon />, path: '/' },
  { label: 'Calendar', icon: <CalendarMonthRoundedIcon />, path: '/calendar' },
  { label: 'Stats', icon: <BarChartRoundedIcon />, path: '/stats' },
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
                  padding: '4px 24px',
                  borderRadius: '24px',
                  backgroundColor:
                    navItems[value].label === item.label
                      ? 'rgba(208, 188, 255, 0.16)'
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
