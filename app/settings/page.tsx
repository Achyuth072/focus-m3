'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  IconButton,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTimer } from '@/components/TimerProvider';
import type { TimerSettings } from '@/lib/types/timer';
import { DEFAULT_TIMER_SETTINGS } from '@/lib/types/timer';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { styled } from '@mui/material/styles';

// Material 3 Expressive Switch
const MaterialSwitch = styled(Switch)(({ theme }) => ({
  width: 52,
  height: 32,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 4,
    margin: 0,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
      },
      '& .MuiSwitch-thumb': {
        width: 24,
        height: 24,
      },
      '& .MuiSwitch-thumb:before': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.primary.contrastText
        )}" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>')`,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: theme.palette.primary.main,
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 24,
    height: 24,
    transform: 'none', // Reset transformation
    transition: theme.transitions.create(['width', 'transform'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings, isLoaded } = useTimer();
  const [localSettings, setLocalSettings] = useState<TimerSettings>(settings);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    // Check current display mode from manifest
    const displayMode = window.matchMedia('(display-mode: fullscreen)').matches;
    setIsFullscreen(displayMode);
  }, []);

  const handleSettingChange = (key: keyof TimerSettings, value: number) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_TIMER_SETTINGS);
    updateSettings(DEFAULT_TIMER_SETTINGS);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

  // Prevent flash of default values
  if (!isLoaded) {
    return null;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Settings
        </Typography>
      </Box>

      {/* Pomodoro Settings */}
      <Card sx={{ mb: 3, borderRadius: '28px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
            Pomodoro Timer
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Focus Duration (minutes)"
              type="number"
              value={localSettings.focusDuration}
              onChange={(e) => handleSettingChange('focusDuration', parseInt(e.target.value) || 25)}
              inputProps={{ min: 1, max: 120 }}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              label="Short Break (minutes)"
              type="number"
              value={localSettings.shortBreakDuration}
              onChange={(e) => handleSettingChange('shortBreakDuration', parseInt(e.target.value) || 5)}
              inputProps={{ min: 1, max: 60 }}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              label="Long Break (minutes)"
              type="number"
              value={localSettings.longBreakDuration}
              onChange={(e) => handleSettingChange('longBreakDuration', parseInt(e.target.value) || 15)}
              inputProps={{ min: 1, max: 120 }}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              label="Sessions before Long Break"
              type="number"
              value={localSettings.sessionsBeforeLongBreak}
              onChange={(e) => handleSettingChange('sessionsBeforeLongBreak', parseInt(e.target.value) || 4)}
              inputProps={{ min: 1, max: 10 }}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!hasChanges}
              sx={{ 
                borderRadius: '28px', 
                flex: 2,
                py: 1.5,
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
              }}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{ 
                borderRadius: '28px', 
                flex: 1,
                py: 1.5,
                fontWeight: 600,
                borderColor: 'divider'
              }}
            >
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card sx={{ borderRadius: '28px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
            Appearance
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ pr: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                Immersive Mode (Fullscreen)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hide the status bar for a distraction-free experience.
              </Typography>
            </Box>
            <MaterialSwitch
              checked={isFullscreen}
              onChange={toggleFullscreen}
              sx={{ mt: 0.5 }}
            />
          </Box>

          <Divider sx={{ my: 2.5, opacity: 0.6 }} />

          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Theme switching coming soon.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
