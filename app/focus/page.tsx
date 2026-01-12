"use client";

import { motion } from "framer-motion";
import { useTimer } from "@/components/TimerProvider";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, SkipForward, X } from "lucide-react";
import { FocusSettingsDialog } from "@/components/FocusSettingsDialog";
import type { TimerMode } from "@/lib/types/timer";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types/task";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { useDocumentPiP } from "@/lib/hooks/useDocumentPiP";
import { PiPTimer } from "@/components/PiPTimer";
import { Minimize2 } from "lucide-react";
import { createPortal } from "react-dom";

const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export default function FocusPage() {
  const router = useRouter();
  const { state, settings, start, pause, stop, skip } = useTimer();
  const supabase = createClient();
  const { trigger, isPhone } = useHaptic();
  const { isPiPSupported, isPiPActive, pipWindow, openPiP, closePiP } =
    useDocumentPiP();

  // Fetch active task if one is set
  const { data: activeTask } = useQuery({
    queryKey: ["task", state.activeTaskId],
    queryFn: async () => {
      if (!state.activeTaskId) return null;
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", state.activeTaskId)
        .single();
      return data as Task | null;
    },
    enabled: !!state.activeTaskId,
  });

  const totalSeconds =
    state.mode === "focus"
      ? settings.focusDuration * 60
      : state.mode === "shortBreak"
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;

  const progress =
    ((totalSeconds - state.remainingSeconds) / totalSeconds) * 100;

  const handlePlayPause = () => {
    if (state.isRunning) {
      pause();
    } else {
      start();
    }
  };

  const handlePiP = async () => {
    trigger(30);
    if (isPiPActive) {
      closePiP();
    } else {
      await openPiP(320, 280);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative select-none cursor-default"
    >
      {/* Close Button */}
      <motion.button
        onClick={() => router.back()}
        onTapStart={() => trigger(50)}
        whileTap={isPhone ? { scale: 0.95 } : {}}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "absolute top-4 left-4 h-14 w-14 rounded-full hover:bg-secondary/50 active:scale-95 active:bg-secondary/30 transition-seijaku cursor-pointer"
        )}
      >
        <X className="h-6 w-6" />
      </motion.button>

      {/* PiP Button - Only show if supported and NOT on phone */}
      {isPiPSupported && !isPhone && (
        <motion.button
          onClick={handlePiP}
          onTapStart={() => trigger(50)}
          whileTap={isPhone ? { scale: 0.95 } : {}}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "absolute top-4 right-4 h-14 w-14 rounded-full hover:bg-secondary/50 active:scale-95 active:bg-secondary/30 transition-seijaku cursor-pointer"
          )}
          title={
            isPiPActive ? "Close Picture-in-Picture" : "Open Picture-in-Picture"
          }
        >
          <Minimize2 className="h-6 w-6" />
        </motion.button>
      )}

      <div className="font-serif text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
        {MODE_LABELS[state.mode]}
      </div>

      {/* Active Task Name */}
      {activeTask && (
        <div className="font-serif text-lg md:text-xl font-medium text-foreground/90 mt-4 max-w-md text-center px-4 italic leading-tight">
          &quot;{activeTask.content}&quot;
        </div>
      )}

      {/* Timer Display */}
      <div className="text-8xl sm:text-9xl md:text-[10rem] font-serif font-bold tracking-tighter text-foreground tabular-nums mt-6">
        {formatTime(state.remainingSeconds)}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs mt-8 mb-4">
        <Progress value={progress} className="h-0.5" />
      </div>

      {/* Session Counter */}
      <p className="text-sm text-muted-foreground mb-8">
        Session {state.completedSessions + 1} of{" "}
        {settings.sessionsBeforeLongBreak}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Stop */}
        <motion.button
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-14 w-14 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 active:bg-accent/50 transition-seijaku cursor-pointer"
          )}
          onTapStart={() => trigger(50)}
          whileTap={isPhone ? { scale: 0.95 } : {}}
          onClick={stop}
        >
          <Square className="h-5 w-5" />
        </motion.button>

        {/* Play/Pause - Main action button */}
        <motion.button
          className={cn(
            buttonVariants({ variant: "default", size: "icon" }),
            "h-20 w-20 rounded-full transition-seijaku hover:scale-105 active:scale-95 active:opacity-90 cursor-pointer"
          )}
          onTapStart={() => trigger(50)}
          whileTap={isPhone ? { scale: 0.95 } : {}}
          onClick={handlePlayPause}
        >
          {state.isRunning ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </motion.button>

        {/* Skip */}
        <motion.button
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-14 w-14 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 active:bg-accent/50 transition-seijaku cursor-pointer"
          )}
          onTapStart={() => trigger(50)}
          whileTap={isPhone ? { scale: 0.95 } : {}}
          onClick={skip}
        >
          <SkipForward className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Settings Dialog */}
      <div className="mt-16">
        <FocusSettingsDialog />
      </div>

      {/* Render PiP Timer into external window using Portal */}
      {pipWindow &&
        createPortal(<PiPTimer onClose={closePiP} />, pipWindow.document.body)}
    </motion.div>
  );
}
