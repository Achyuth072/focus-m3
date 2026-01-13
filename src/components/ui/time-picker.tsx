"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
  showSelection?: boolean;
}

export function TimePicker({
  value,
  onChange,
  className,
  showSelection = true,
}: TimePickerProps) {
  const hours12 = value.getHours() % 12 || 12;
  const minutes = value.getMinutes();
  const isPM = value.getHours() >= 12;

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const handleHourChange = (hour: number) => {
    const newDate = new Date(value);
    const hours24 = isPM
      ? hour === 12
        ? 12
        : hour + 12
      : hour === 12
      ? 0
      : hour;
    newDate.setHours(hours24);
    onChange(newDate);
  };

  const handleMinuteChange = (minute: number) => {
    const newDate = new Date(value);
    newDate.setMinutes(minute);
    onChange(newDate);
  };

  const handlePeriodChange = (pm: boolean) => {
    const newDate = new Date(value);
    const currentHour = value.getHours();
    if (pm && currentHour < 12) {
      newDate.setHours(currentHour + 12);
    } else if (!pm && currentHour >= 12) {
      newDate.setHours(currentHour - 12);
    }
    onChange(newDate);
  };

  // Handle wheel scrolling manually since buttons capture wheel events
  const handleWheel = (
    e: React.WheelEvent,
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    if (ref.current) {
      ref.current.scrollTop += e.deltaY;
    }
  };

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-1.5 px-3 py-1.5 border-t border-border w-[280px]",
        className
      )}
    >
      {/* Hours */}
      <div className="flex flex-col items-center">
        <label className="text-[10px] text-muted-foreground mb-0.5 text-center shrink-0">
          Hour
        </label>
        <div
          ref={hourRef}
          onWheel={(e) => handleWheel(e, hourRef)}
          className="h-[80px] w-full overflow-y-auto overscroll-contain scrollbar-hide"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
            <div
              key={hour}
              role="button"
              tabIndex={0}
              onClick={() => handleHourChange(hour)}
              onKeyDown={(e) => e.key === "Enter" && handleHourChange(hour)}
              className={cn(
                "w-full py-1 text-xs rounded transition-colors text-center cursor-pointer select-none",
                showSelection && hours12 === hour
                  ? "bg-brand text-brand-foreground font-medium"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {hour.toString().padStart(2, "0")}
            </div>
          ))}
        </div>
      </div>

      {/* Minutes */}
      <div className="flex flex-col items-center">
        <label className="text-[10px] text-muted-foreground mb-0.5 text-center shrink-0">
          Min
        </label>
        <div
          ref={minuteRef}
          onWheel={(e) => handleWheel(e, minuteRef)}
          className="h-[80px] w-full overflow-y-auto overscroll-contain scrollbar-hide"
        >
          {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
            <div
              key={minute}
              role="button"
              tabIndex={0}
              onClick={() => handleMinuteChange(minute)}
              onKeyDown={(e) => e.key === "Enter" && handleMinuteChange(minute)}
              className={cn(
                "w-full py-1 text-xs rounded transition-colors text-center cursor-pointer select-none",
                showSelection && minutes === minute
                  ? "bg-brand text-brand-foreground font-medium"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {minute.toString().padStart(2, "0")}
            </div>
          ))}
        </div>
      </div>

      {/* AM/PM */}
      <div className="flex flex-col items-center">
        <label className="text-[10px] text-muted-foreground mb-0.5 text-center shrink-0">
          Period
        </label>
        <div className="flex flex-col gap-1 w-full h-[80px] justify-center">
          <div
            role="button"
            tabIndex={0}
            onClick={() => handlePeriodChange(false)}
            onKeyDown={(e) => e.key === "Enter" && handlePeriodChange(false)}
            className={cn(
              "w-full py-2 text-xs rounded transition-colors text-center cursor-pointer select-none",
              showSelection && !isPM
                ? "bg-brand text-brand-foreground font-medium"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            AM
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => handlePeriodChange(true)}
            onKeyDown={(e) => e.key === "Enter" && handlePeriodChange(true)}
            className={cn(
              "w-full py-2 text-xs rounded transition-colors text-center cursor-pointer select-none",
              showSelection && isPM
                ? "bg-brand text-brand-foreground font-medium"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            PM
          </div>
        </div>
      </div>
    </div>
  );
}
