"use client";

import { useTimer } from "@/components/TimerProvider";
import { Play, Pause, X } from "lucide-react";
import { useEffect } from "react";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

interface PiPTimerProps {
  onClose?: () => void;
}

export function PiPTimer({ onClose }: PiPTimerProps) {
  const { state, start, pause } = useTimer();

  const handlePlayPause = () => {
    if (state.isRunning) {
      pause();
    } else {
      start();
    }
  };

  // Prevent default context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-background p-4 select-none">
      {/* Mode Badge */}
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
        {state.mode === "focus"
          ? "Focus"
          : state.mode === "shortBreak"
          ? "Short Break"
          : "Long Break"}
      </div>

      {/* Timer Display */}
      <div className="text-5xl font-light font-mono tracking-tight text-foreground tabular-nums mb-4">
        {formatTime(state.remainingSeconds)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePlayPause}
          aria-label={state.isRunning ? "Pause timer" : "Start timer"}
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
        >
          {state.isRunning ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close Picture-in-Picture"
            className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/80 active:scale-95 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Session Counter */}
      <div className="text-xs text-muted-foreground mt-3">
        {state.mode === "focus"
          ? `Session ${state.completedSessions + 1}`
          : state.mode === "longBreak"
          ? "Cycle Complete"
          : `Break after Session ${state.completedSessions}`}
      </div>
    </div>
  );
}
