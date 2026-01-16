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
  const lastReconciledStartedAtRef = useRef<number | null>(null); // Guard against multiple reconciliations of the same session
  const pendingCompletionToastRef = useRef<{
    title: string;
    description: string;
  } | null>(null);
  const stateRef = useRef(state); // Always have latest state access for reconciliation without breaking dependencies
  const supabase = createClient();
  const { isGuestMode } = useAuth();
  const { play } = useFocusSounds();
  const { trigger } = useHaptic();

  // Sync state reference synchronously so any callback created or called in this render sees latest state
  stateRef.current = state;

  // Persist settings changes
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

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

  /**
   * Pure function to calculate the next state after a timer completion.
   * No side effects allowed here!
   */
  const getNextStateAfterCompletion = useCallback(
    (prev: TimerState): TimerState => {
      if (prev.mode === "focus") {
        const newCompletedSessions = prev.completedSessions + 1;
        const isLongBreakTime =
          newCompletedSessions >= settings.sessionsBeforeLongBreak;
        const nextMode: TimerMode = isLongBreakTime
          ? "longBreak"
          : "shortBreak";

        return {
          ...prev,
          mode: nextMode,
          isRunning: settings.autoStartBreak,
          remainingSeconds: getDurationForMode(nextMode, settings),
          completedSessions: isLongBreakTime ? 0 : newCompletedSessions,
          startedAt: settings.autoStartBreak ? Date.now() : null,
        };
      }

      // After break, back to focus
      return {
        ...prev,
        mode: "focus",
        isRunning: settings.autoStartFocus,
        remainingSeconds: getDurationForMode("focus", settings),
        startedAt: settings.autoStartFocus ? Date.now() : null,
      };
    },
    [settings]
  );

  /**
   * Managed completion that handles side effects outside of setState.
   */
  const completeTimer = useCallback(
    (options?: {
      skipNotification?: boolean;
      skipLog?: boolean;
      skipToast?: boolean;
    }) => {
      const prevState = stateRef.current;
      const nextState = getNextStateAfterCompletion(prevState);

      // Perform state transition
      setState(nextState);

      // Reset notification ref
      notificationIdRef.current = null;

      // Log focus if needed
      if (!options?.skipLog && prevState.mode === "focus") {
        if (prevState.activeTaskId) {
          logFocusSession(prevState.activeTaskId, settings.focusDuration * 60);
        }
        useFocusHistoryStore.getState().addSession({
          taskId: prevState.activeTaskId,
          duration: settings.focusDuration * 60,
          completedAt: new Date().toISOString(),
        });
      }

      // Side feedback
      if (prevState.mode === "focus") {
        play("sessionComplete");
      } else {
        play("breakEnd");
      }
      trigger(50);

      // Show toast / notification
      const modeName = prevState.mode === "focus" ? "focus session" : "break";
      const title =
        prevState.mode === "focus"
          ? "Focus session completed"
          : "Break completed";

      const description =
        nextState.isRunning && nextState.mode !== prevState.mode
          ? `Automatically started ${
              nextState.mode === "shortBreak" ? "short break" : "focus"
            }`
          : "The timer is ready for your next session.";

      if (!options?.skipToast) {
        if (document.hidden) {
          // App in background, queue toast for when we return
          pendingCompletionToastRef.current = { title, description };
        } else {
          // App visible, show toast if away from focus page or PIP
          const isPipActive = useUiStore.getState().isPipActive;
          const isOnFocusPage = pathname === "/focus";

          if (!isOnFocusPage && !isPipActive) {
            toast(title, {
              description,
              duration: 4000,
              icon: null,
            });
          }
        }
      }

      // Smart push notification logic
      if (!options?.skipNotification) {
        const isPipActive = useUiStore.getState().isPipActive;
        const isOnFocusPage = pathname === "/focus";

        if (document.hidden || (!isOnFocusPage && !isPipActive)) {
          showNotification(
            prevState.mode === "focus"
              ? "Focus Complete 🎯"
              : "Break Complete ☕",
            {
              body:
                prevState.mode === "focus"
                  ? "Your focus session is complete. Take a break!"
                  : "Your break is over. Time to focus!",
              tag: "timer-notification",
              renotify: true,
            } as any
          );
        }
      }

      return nextState;
    },
    [
      getNextStateAfterCompletion,
      logFocusSession,
      settings,
      play,
      trigger,
      pathname,
      showNotification,
    ]
  );

  const reconcileTimerState = useCallback(() => {
    // 1. Check if there's a pending toast from an automatic transition in background
    // We check this FIRST because it should show even if the timer has since stopped
    if (pendingCompletionToastRef.current) {
      const { title, description } = pendingCompletionToastRef.current;
      toast(title, { description, duration: 4000, icon: null });
      pendingCompletionToastRef.current = null;
    }

    const currentState = stateRef.current;
    if (!currentState.isRunning || !currentState.startedAt) return;

    const elapsedMs = Date.now() - currentState.startedAt;
    const totalMs = getDurationForMode(currentState.mode, settings) * 1000;

    if (elapsedMs >= totalMs) {
      // Prevent duplicate transitions for the same session
      if (lastReconciledStartedAtRef.current === currentState.startedAt) return;
      lastReconciledStartedAtRef.current = currentState.startedAt;

      // Perform transition side-effect-free in a managed wrap
      // We pass skipToast: true because reconcileTimerState will show its own specialized "while away" toast
      const nextState = completeTimer({
        skipNotification: true,
        skipToast: true,
      });

      // Clean up any pending toast from completeTimer just in case
      pendingCompletionToastRef.current = null;

      // Zen-Modernism toast (Side effect outside setState)
      toast(
        currentState.mode === "focus"
          ? "Focus session completed while away"
          : "Break completed while away",
        {
          description:
            nextState.isRunning && nextState.mode !== currentState.mode
              ? `Automatically started ${
                  nextState.mode === "shortBreak" ? "short break" : "focus"
                }`
              : "The timer is ready for your next session.",
          duration: 4000,
          icon: null,
        }
      );
    } else {
      // Still running, sync remaining seconds
      const newRemaining = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
      setState((prev) => ({
        ...prev,
        remainingSeconds: newRemaining,
      }));
    }
  }, [settings, completeTimer]);

  // Ref to always have latest reconcileTimerState without effect re-runs
  const reconcileTimerStateRef = useRef(reconcileTimerState);
  reconcileTimerStateRef.current = reconcileTimerState;

  // Handle visibility change for state reconciliation
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reconcileTimerStateRef.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Initial reconciliation on mount
    reconcileTimerStateRef.current();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []); // Run only once on mount

  // Timer tick
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        const currentState = stateRef.current;
        if (currentState.remainingSeconds <= 0) {
          completeTimer();
          return;
        }

        // Warning sounds at 1 minute remaining (Outside setState)
        if (currentState.remainingSeconds === 61) {
          if (currentState.mode === "focus") {
            play("sessionWarning");
          } else {
            play("breakWarning");
          }
        }

        setState((prev) => ({
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        }));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, completeTimer, play]);

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

      // Clear any pending toasts when starting a new session
      pendingCompletionToastRef.current = null;

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
    completeTimer({ skipLog: true }); // Skipping doesn't count as a full completed session for logs
  }, [completeTimer]);

  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
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
