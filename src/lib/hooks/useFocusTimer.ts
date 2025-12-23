"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { TimerMode, TimerState, TimerSettings } from "@/lib/types/timer";
import {
  DEFAULT_TIMER_SETTINGS,
  TIMER_STATE_KEY,
  TIMER_SETTINGS_KEY,
} from "@/lib/types/timer";
import { useFocusHistoryStore } from "@/lib/store/focusHistoryStore";

function loadSettings(): TimerSettings {
  if (typeof window === "undefined") return DEFAULT_TIMER_SETTINGS;
  try {
    const stored = localStorage.getItem(TIMER_SETTINGS_KEY);
    return stored
      ? { ...DEFAULT_TIMER_SETTINGS, ...JSON.parse(stored) }
      : DEFAULT_TIMER_SETTINGS;
  } catch {
    return DEFAULT_TIMER_SETTINGS;
  }
}

function saveSettings(settings: TimerSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TIMER_SETTINGS_KEY, JSON.stringify(settings));
}

function loadState(): TimerState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(TIMER_STATE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveState(state: TimerState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
}

function clearState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TIMER_STATE_KEY);
}

function getDurationForMode(mode: TimerMode, settings: TimerSettings): number {
  switch (mode) {
    case "focus":
      return settings.focusDuration * 60;
    case "shortBreak":
      return settings.shortBreakDuration * 60;
    case "longBreak":
      return settings.longBreakDuration * 60;
  }
}

/**
 * Pomodoro Focus Timer Hook
 *
 * State machine: Focus -> Short Break -> Focus -> ... -> Long Break
 */
export function useFocusTimer() {
  const [settings, setSettingsState] = useState<TimerSettings>(
    DEFAULT_TIMER_SETTINGS
  );
  const [state, setState] = useState<TimerState>({
    mode: "focus",
    isRunning: false,
    remainingSeconds: DEFAULT_TIMER_SETTINGS.focusDuration * 60,
    completedSessions: 0,
    activeTaskId: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Load from localStorage on mount
  useEffect(() => {
    const storedSettings = loadSettings();
    setSettingsState(storedSettings);

    const storedState = loadState();
    if (storedState) {
      setState(storedState);
    } else {
      setState((prev) => ({
        ...prev,
        remainingSeconds: storedSettings.focusDuration * 60,
      }));
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    if (state.isRunning || state.completedSessions > 0 || state.activeTaskId) {
      saveState(state);
    }
  }, [state]);

  // Timer tick
  useEffect(() => {
    if (state.isRunning && state.remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const newRemaining = prev.remainingSeconds - 1;
          if (newRemaining <= 0) {
            // Timer finished, handle transition
            return handleTimerComplete(prev);
          }
          return { ...prev, remainingSeconds: newRemaining };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, state.remainingSeconds]);

  const handleTimerComplete = useCallback(
    (prev: TimerState): TimerState => {
      // If it was a focus session, increment completed sessions
      if (prev.mode === "focus") {
        const newCompletedSessions = prev.completedSessions + 1;
        const isLongBreakTime =
          newCompletedSessions >= settings.sessionsBeforeLongBreak;
        const nextMode: TimerMode = isLongBreakTime
          ? "longBreak"
          : "shortBreak";

        // Log focus session to DB (fire and forget)
        if (prev.activeTaskId) {
          logFocusSession(prev.activeTaskId, settings.focusDuration * 60);
        }

        // Log to local history for Stats
        useFocusHistoryStore.getState().addSession({
          taskId: prev.activeTaskId,
          duration: settings.focusDuration * 60,
          completedAt: new Date().toISOString(),
        });

        return {
          ...prev,
          mode: nextMode,
          isRunning: false,
          remainingSeconds: getDurationForMode(nextMode, settings),
          completedSessions: isLongBreakTime ? 0 : newCompletedSessions,
        };
      }

      // After a break, go back to focus
      return {
        ...prev,
        mode: "focus",
        isRunning: false,
        remainingSeconds: getDurationForMode("focus", settings),
      };
    },
    [settings]
  );

  const logFocusSession = async (taskId: string, durationSeconds: number) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("focus_logs").insert({
        task_id: taskId,
        user_id: user.id,
        start_time: new Date(Date.now() - durationSeconds * 1000).toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: durationSeconds,
      });
    } catch (err) {
      console.error("Failed to log focus session:", err);
    }
  };

  // Controls
  const start = useCallback((taskId?: string) => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
      activeTaskId: taskId ?? prev.activeTaskId,
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const stop = useCallback(() => {
    clearState();
    setState({
      mode: "focus",
      isRunning: false,
      remainingSeconds: settings.focusDuration * 60,
      completedSessions: 0,
      activeTaskId: null,
    });
  }, [settings]);

  const skip = useCallback(() => {
    setState((prev) => handleTimerComplete(prev));
  }, [handleTimerComplete]);

  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  return {
    state,
    settings,
    start,
    pause,
    stop,
    skip,
    updateSettings,
  };
}
