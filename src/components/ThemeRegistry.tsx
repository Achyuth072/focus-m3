'use client';

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from '@/theme/theme';

// Mobile polish styles for native-app-like experience
const mobileStyles = {
  'html, body': {
    // Prevent pull-to-refresh rubber banding
    overscrollBehaviorY: 'none',
    // Remove tap highlight on Android
    WebkitTapHighlightColor: 'transparent',
    // Prevent text selection on UI elements
    userSelect: 'none',
    // Optimize touch handling
    touchAction: 'pan-x pan-y',
  },
  // Re-enable text selection for inputs
  'input, textarea': {
    userSelect: 'text',
  },
};

function createEmotionCache() {
  return createCache({ key: 'mui' });
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(() => {
    const cache = createEmotionCache();
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted);
    if (names.length === 0) return null;

    let styles = '';
    for (const name of names) {
      const value = cache.inserted[name];
      if (typeof value === 'string') styles += value;
    }

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={mobileStyles} />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
