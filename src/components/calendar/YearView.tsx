"use client";

import { addMonths, startOfYear } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useMemo, memo } from "react";

interface YearViewProps {
  currentYear: number;
  onDateClick?: (date: Date) => void;
  className?: string;
}

const YearMonth = memo(
  ({
    monthDate,
    onDateClick,
  }: {
    monthDate: Date;
    onDateClick?: (date: Date) => void;
  }) => {
    return (
      <div className="flex justify-center">
        <Calendar
          mode="single"
          month={monthDate}
          selected={undefined}
          onSelect={(date) => date && onDateClick?.(date)}
          showOutsideDays={false}
          className="p-0 select-none [--cell-size:28px]"
          classNames={{
            months: "flex flex-col",
            month: "space-y-3",
            nav: "hidden",
            caption_label:
              "font-serif text-[15px] font-bold tracking-tight text-primary lowercase",
            weekdays: "flex gap-1",
            weekday:
              "text-muted-foreground/40 w-[28px] font-serif text-[10px] font-bold italic lowercase",
            week: "flex w-full mt-1 gap-1",
            day: cn(
              "group/day relative h-[28px] w-[28px] p-0 font-mono text-[11px] select-none text-center",
              "hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground/80"
            ),
            today:
              "bg-primary text-primary-foreground font-bold rounded-none !opacity-100 shadow-sm",
            selected:
              "bg-primary text-primary-foreground rounded-none hover:bg-primary hover:text-primary-foreground",
            outside: "invisible",
            disabled: "text-muted-foreground opacity-20",
          }}
        />
      </div>
    );
  }
);

YearMonth.displayName = "YearMonth";

const YearView = memo(
  ({ currentYear, onDateClick, className }: YearViewProps) => {
    const start = useMemo(
      () => startOfYear(new Date(currentYear, 0, 1)),
      [currentYear]
    );

    return (
      <div className={cn("h-full overflow-y-auto bg-background", className)}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-8 p-8 max-w-7xl mx-auto">
          {Array.from({ length: 12 }).map((_, i) => (
            <YearMonth
              key={i}
              monthDate={addMonths(start, i)}
              onDateClick={onDateClick}
            />
          ))}
        </div>
      </div>
    );
  }
);

YearView.displayName = "YearView";

export { YearView };
