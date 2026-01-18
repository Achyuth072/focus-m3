"use client";

import { memo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useHaptic } from "@/lib/hooks/useHaptic";

interface EventOverflowPopoverProps {
  remainingEvents: CalendarEvent[];
  day: Date;
}

export const EventOverflowPopover = memo(
  ({ remainingEvents, day }: EventOverflowPopoverProps) => {
    const { trigger } = useHaptic();

    if (remainingEvents.length === 0) return null;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation();
              trigger(15); // Toggle haptic
            }}
            className="text-[10px] md:text-xs text-muted-foreground px-1 md:px-2 hover:text-foreground transition-colors text-left"
          >
            +{remainingEvents.length} more
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-3 bg-popover/95 backdrop-blur-md border-border/40 shadow-xl"
          align="start"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/20 pb-2">
              {format(day, "EEE, MMM d")}
            </h4>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {remainingEvents.map((event) => (
                <div
                  key={event.id}
                  className="group flex flex-col gap-0.5 p-2 rounded-lg bg-(--event-color)/10 border border-(--event-color)/20 transition-all hover:bg-(--event-color)/20"
                  style={
                    {
                      "--event-color": event.color || "hsl(var(--brand))",
                    } as React.CSSProperties
                  }
                >
                  <span className="text-[11px] font-bold text-foreground truncate">
                    {event.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {format(event.start, "h:mm a")} -{" "}
                    {format(event.end, "h:mm a")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

EventOverflowPopover.displayName = "EventOverflowPopover";
