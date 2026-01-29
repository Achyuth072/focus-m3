"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCurrentTime } from "@/lib/hooks/useCurrentTime";

const HOUR_HEIGHT = 120;
const HEADER_HEIGHT = 64;

interface CurrentTimeIndicatorProps {
  className?: string;
}

/**
 * CurrentTimeIndicator displays a real-time horizontal line representing "now" on the calendar grid.
 * Styled according to Zen-Modernism: Kanso Blue, high contrast, dampened transitions.
 */
export function CurrentTimeIndicator({ className }: CurrentTimeIndicatorProps) {
  const now = useCurrentTime(60000); // Update every minute

  const topPx = useMemo(() => {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT + HEADER_HEIGHT;
  }, [now]);

  return (
    <div
      data-testid="current-time-indicator"
      className={cn(
        "absolute left-0 right-0 z-30 flex items-center pointer-events-none transition-all duration-500 ease-in-out",
        className,
      )}
      style={{ top: `${topPx}px` }}
    >
      {/* The Dot/Label on the left */}
      <div className="absolute -left-1 md:-left-1.5 flex items-center">
        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-brand shadow-[0_0_0_2px_rgba(255,255,255,1)] dark:shadow-[0_0_0_2px_rgba(26,26,26,1)]" />
        <span className="ml-2 px-1.5 py-0.5 rounded bg-brand text-white text-[9px] md:text-[10px] font-bold leading-none uppercase tracking-wider">
          {format(now, "h:mm a")}
        </span>
      </div>

      {/* The Horizontal Line */}
      <div className="w-full h-[2px] bg-brand/60" />
    </div>
  );
}
