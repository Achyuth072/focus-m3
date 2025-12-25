'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useFocusTimer } from '@/lib/hooks/useFocusTimer';
import type { TimerState, TimerSettings } from '@/lib/types/timer';

interface TimerContextValue {
  state: TimerState;
  settings: TimerSettings;
  isLoaded: boolean;
  start: (taskId?: string) => void;
  pause: () => void;
  stop: () => void;
  skip: () => void;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const timer = useFocusTimer();

  return (
    <TimerContext.Provider value={timer}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
