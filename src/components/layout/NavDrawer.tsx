'use client';

import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function NavDrawer({ open, onClose }: NavDrawerProps) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 280,
            bgcolor: 'background.paper',
            borderRadius: '0 28px 28px 0',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ color: 'primary.contrastText', fontWeight: 700, fontSize: '1.25rem' }}>
            F
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            FocusM3
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Productivity Super-App
          </Typography>
        </Box>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1, pt: 2 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => handleNavigate('/settings')}
            sx={{
              mx: 1.5,
              borderRadius: '28px',
              py: 1.5,
              '&:hover': { bgcolor: 'rgba(208, 188, 255, 0.08)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 44 }}>
              <SettingsRoundedIcon />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <InfoRoundedIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          Version 1.1.0 (Expressive)
        </Typography>
      </Box>
    </Drawer>
  );
}
