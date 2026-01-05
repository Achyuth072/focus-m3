"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { DrumPicker } from "./drum-picker";

interface LargeTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function LargeTimePicker({
  value,
  onChange,
  className,
}: LargeTimePickerProps) {
  const hours12 = value.getHours() % 12 || 12;
  const minutes = value.getMinutes();
  const isPM = value.getHours() >= 12;

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleHourChange = (newHour: string) => {
    const hourValue = parseInt(newHour, 10);
    const newDate = new Date(value);
    const hours24 = isPM
      ? hourValue === 12 ? 12 : hourValue + 12
      : hourValue === 12 ? 0 : hourValue;
    newDate.setHours(hours24);
    onChange(newDate);
  };

  const handleMinuteChange = (newMinute: string) => {
    const minuteValue = parseInt(newMinute, 10);
    const newDate = new Date(value);
    newDate.setMinutes(minuteValue);
    onChange(newDate);
  };

  const togglePeriod = () => {
    const newDate = new Date(value);
    const currentHour = value.getHours();
    
    if (isPM) {
      // Switch to AM
      newDate.setHours(currentHour - 12);
    } else {
      // Switch to PM
      newDate.setHours(currentHour + 12);
    }
    onChange(newDate);
  };

  return (
    <div className={cn('flex items-center justify-center gap-4 h-[160px] w-full max-w-[320px] mx-auto', className)}>
      <div className="flex gap-2">
        <DrumPicker
          items={hoursList}
          value={hours12.toString()}
          onChange={handleHourChange}
          className="w-20"
        />
        <DrumPicker
          items={minutesList}
          value={minutes.toString().padStart(2, '0')}
          onChange={handleMinuteChange}
          bufferCount={3} // Optimize: only render 3x buffer (180 items) instead of 5x
          className="w-20"
        />
      </div>
      
      <div className="flex flex-col gap-2 h-[160px] justify-center">
        <div className="flex flex-col bg-muted/20 p-1 rounded-lg">
          <button
            onClick={() => isPM && togglePeriod()}
            className={cn(
              "w-12 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-all",
              !isPM 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:text-primary/70"
            )}
            disabled={!isPM}
          >
            AM
          </button>
          <button
            onClick={() => !isPM && togglePeriod()}
            className={cn(
              "w-12 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-all",
              isPM 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:text-primary/70"
            )}
            disabled={isPM}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
}

