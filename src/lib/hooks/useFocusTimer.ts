"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUiStore } from "@/lib/store/uiStore";
import type { TimerMode, TimerState, TimerSettings } from "@/lib/types/timer";
import {
  DEFAULT_TIMER_SETTINGS,
  TIMER_STATE_KEY,
  TIMER_SETTINGS_KEY,
} from "@/lib/types/timer";
import { useFocusHistoryStore } from "@/lib/store/focusHistoryStore";
import { useAuth } from "@/components/AuthProvider";
import { mockStore } from "@/lib/mock/mock-store";
import { useFocusSounds } from "@/lib/hooks/useFocusSounds";
import { usePathname } from "next/navigation";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import {
  scheduleTimerNotification,
  cancelTimerNotification,
} from "@/lib/timer-api";
import { toast } from "sonner";
import { useHaptic } from "@/lib/hooks/useHaptic";

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
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { showNotification } = usePushNotifications();

  // NOTE: uncertain intent — lazy initialization to ensure SSR safety and state persistence on mount.
  const [settings, setSettingsState] = useState<TimerSettings>(() =>
    loadSettings()
  );

  const [state, setState] = useState<TimerState>(() => {
    const storedState = loadState();
    if (storedState) {
      return storedState;
    }
    // Use loaded settings for initial remaining seconds
    const initialSettings = loadSettings();
    return {
      mode: "focus" as TimerMode,
      isRunning: false,
      remainingSeconds: initialSettings.focusDuration * 60,
      completedSessions: 0,
      activeTaskId: null,
      startedAt: null,
    };
  });

  // Track if hydration is complete (for UI purposes)
  const isLoaded = typeof window !== "undefined";

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  const supabase = createClient();
  const { isGuestMode } = useAuth();
  const { play } = useFocusSounds();
  const { trigger } = useHaptic();

  // Persist state changes
  useEffect(() => {
    if (state.isRunning || state.completedSessions > 0 || state.activeTaskId) {
      saveState(state);
    }
  }, [state]);

  const logFocusSession = useCallback(
    async (taskId: string, durationSeconds: number) => {
      try {
        if (isGuestMode) {
          mockStore.addFocusLog({
            task_id: taskId,
            user_id: "guest",
            start_time: new Date(
              Date.now() - durationSeconds * 1000
            ).toISOString(),
            end_time: new Date().toISOString(),
            duration_seconds: durationSeconds,
          });
          queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("focus_logs").insert({
          task_id: taskId,
          user_id: user.id,
          start_time: new Date(
            Date.now() - durationSeconds * 1000
          ).toISOString(),
          end_time: new Date().toISOString(),
          duration_seconds: durationSeconds,
        });

        // Invalidate stats to trigger immediate update
        queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
      } catch (err) {
        console.error("Failed to log focus session:", err);
      }
    },
    [supabase, queryClient, isGuestMode]
  );

  const handleCancelNotification = useCallback(async () => {
    if (notificationIdRef.current) {
      try {
        await cancelTimerNotification(notificationIdRef.current);
        notificationIdRef.current = null;
      } catch (err) {
        console.warn("Failed to cancel timer notification:", err);
      }
    }
  }, []);

  const handleTimerComplete = useCallback(
    (prev: TimerState): TimerState => {
      // Clear current notification ID so the auto-scheduler can pick up the next mode
      notificationIdRef.current = null;

      // Smart notifications: trigger if user is NOT visually seeing a timer
      // 1. User is on the focus page
      // 2. Document PIP is active
      // 3. User is in the app and has a visible indicator (FloatingTimer on desktop or MobileHeader on phone)
      const isPipActive = useUiStore.getState().isPipActive;
      const isOnFocusPage = pathname === "/focus";

      // Smart notifications: trigger if user is away or document hidden,
      // but SUPPRESS if Document PIP is active as it provides its own visibility.
      if (document.hidden || (!isOnFocusPage && !isPipActive)) {
        showNotification(
          prev.mode === "focus" ? "Focus Complete 🎯" : "Break Complete ☕",
          {
            body:
              prev.mode === "focus"
                ? "Your focus session is complete. Take a break!"
                : "Your break is over. Time to focus!",
            tag: "timer-notification",
            renotify: true,
          } as any
        );
      }

      if (prev.mode === "focus") {
        const newCompletedSessions = prev.completedSessions + 1;
        const isLongBreakTime =
          newCompletedSessions >= settings.sessionsBeforeLongBreak;
        const nextMode: TimerMode = isLongBreakTime
          ? "longBreak"
          : "shortBreak";

        // Log focus session
        if (prev.activeTaskId) {
          logFocusSession(prev.activeTaskId, settings.focusDuration * 60);
        }

        useFocusHistoryStore.getState().addSession({
          taskId: prev.activeTaskId,
          duration: settings.focusDuration * 60,
          completedAt: new Date().toISOString(),
        });

        // Play success sound
        play("sessionComplete");

        return {
          ...prev,
          mode: nextMode,
          isRunning: settings.autoStartBreak, // Auto-start break if enabled
          remainingSeconds: getDurationForMode(nextMode, settings),
          completedSessions: isLongBreakTime ? 0 : newCompletedSessions,
          startedAt: settings.autoStartBreak ? Date.now() : null,
        };
      }

      // After a break, go back to focus
      // Play break end sound
      play("breakEnd");

      return {
        ...prev,
        mode: "focus",
        isRunning: settings.autoStartFocus, // Auto-start if enabled
        remainingSeconds: getDurationForMode("focus", settings),
        startedAt: settings.autoStartFocus ? Date.now() : null,
      };
    },
    [settings, logFocusSession, play, pathname, showNotification]
  );

  const reconcileTimerState = useCallback(() => {
    if (!state.isRunning || !state.startedAt) return;

    const elapsedMs = Date.now() - state.startedAt;
    const totalMs = getDurationForMode(state.mode, settings) * 1000;

    if (elapsedMs >= totalMs) {
      // Session finished while away
      setState((prev) => {
        const nextState = handleTimerComplete(prev);
        // Zen haptic feedback for completion
        trigger(50);

        // Minimal Zen-Modernism toast
        toast(
          prev.mode === "focus"
            ? "Focus session completed while away"
            : "Break completed while away",
          {
            description:
              nextState.isRunning && nextState.mode !== prev.mode
                ? `Automatically started ${
                    nextState.mode === "shortBreak" ? "short break" : "focus"
                  }`
                : "The timer is ready for your next session.",
            duration: 4000,
            icon: null, // Minimal - no icon
          }
        );
        return nextState;
      });
    } else {
      // Still running, update the remaining seconds
      const newRemaining = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
      setState((prev) => ({
        ...prev,
        remainingSeconds: newRemaining,
      }));
    }
  }, [
    state.isRunning,
    state.startedAt,
    state.mode,
    settings,
    handleTimerComplete,
  ]);

  // Handle visibility change for state reconciliation
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reconcileTimerState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Also reconcile on mount
    reconcileTimerState();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reconcileTimerState]);

  // Timer tick
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.remainingSeconds <= 0) {
            // Timer finished, handle transition
            return handleTimerComplete(prev);
          }

          // Warning sounds at 1 minute remaining
          if (prev.remainingSeconds === 60) {
            if (prev.mode === "focus") {
              play("sessionWarning");
            } else {
              play("breakWarning");
            }
          }

          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, handleTimerComplete, play]);

  // Handle server-side notification scheduling for auto-started sessions or transitions
  useEffect(() => {
    if (state.isRunning && !isGuestMode && !notificationIdRef.current) {
      const schedule = async () => {
        try {
          const { notificationId } = await scheduleTimerNotification({
            duration: state.remainingSeconds,
            taskId: state.activeTaskId,
            mode: state.mode,
          });
          notificationIdRef.current = notificationId;
        } catch (err) {
          console.warn("Failed to auto-schedule timer notification:", err);
        }
      };
      schedule();
    }
  }, [state.isRunning, state.mode, isGuestMode, state.activeTaskId]);

  // Controls
  const start = useCallback(
    async (taskId?: string) => {
      play("focusStart");

      const targetTaskId = taskId ?? state.activeTaskId;

      // Schedule server-side notification
      if (!isGuestMode) {
        try {
          const { notificationId } = await scheduleTimerNotification({
            duration: state.remainingSeconds,
            taskId: targetTaskId,
            mode: state.mode,
          });
          notificationIdRef.current = notificationId;
        } catch (err) {
          console.warn("Failed to schedule timer notification:", err);
        }
      }

      setState((prev) => ({
        ...prev,
        isRunning: true,
        activeTaskId: targetTaskId,
        startedAt: Date.now(),
      }));
    },
    [play, isGuestMode, state.remainingSeconds, state.activeTaskId, state.mode]
  );

  const pause = useCallback(() => {
    handleCancelNotification();
    setState((prev) => ({ ...prev, isRunning: false, startedAt: null }));
  }, [handleCancelNotification]);

  const stop = useCallback(() => {
    handleCancelNotification();
    clearState();
    setState({
      mode: "focus",
      isRunning: false,
      remainingSeconds: settings.focusDuration * 60,
      completedSessions: 0,
      activeTaskId: null,
      startedAt: null,
    });
  }, [settings, handleCancelNotification]);

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
    isLoaded,
    start,
    pause,
    stop,
    skip,
    updateSettings,
  };
}
