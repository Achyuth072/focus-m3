'use client';

import { motion } from 'framer-motion';
import { useTimer } from '@/components/TimerProvider';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, SkipForward, X } from 'lucide-react';
import { FocusSettingsDialog } from '@/components/FocusSettingsDialog';
import type { TimerMode } from '@/lib/types/timer';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function FocusPage() {
  const router = useRouter();
  const { state, settings, start, pause, stop, skip } = useTimer();

  const totalSeconds =
    state.mode === 'focus'
      ? settings.focusDuration * 60
      : state.mode === 'shortBreak'
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60;

  const progress = ((totalSeconds - state.remainingSeconds) / totalSeconds) * 100;

  const handlePlayPause = () => {
    if (state.isRunning) {
      pause();
    } else {
      start();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative select-none cursor-default"
    >
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="absolute top-4 left-4"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Mode Badge */}
      <div className="px-4 py-1.5 rounded-full mb-8 text-sm font-medium bg-secondary text-secondary-foreground">
        {MODE_LABELS[state.mode]}
      </div>

      {/* Timer Display */}
      <div className="text-7xl sm:text-8xl md:text-9xl font-extralight font-mono tracking-tight text-foreground">
        {formatTime(state.remainingSeconds)}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs mt-8 mb-4">
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Session Counter */}
      <p className="text-sm text-muted-foreground mb-8">
        Session {state.completedSessions + 1} of {settings.sessionsBeforeLongBreak}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Stop */}
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full"
          onClick={stop}
        >
          <Square className="h-5 w-5" />
        </Button>

        {/* Play/Pause - Main action button */}
        <Button
          size="icon"
          className={cn(
            "h-20 w-20 rounded-full transition-transform",
            "hover:scale-105 active:scale-95"
          )}
          onClick={handlePlayPause}
        >
          {state.isRunning ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </Button>

        {/* Skip */}
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full"
          onClick={skip}
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Settings Dialog */}
      <div className="mt-16">
        <FocusSettingsDialog />
      </div>
    </motion.div>
  );
}
