"use client";

import { useMemo } from "react";
import { ActivityCalendar, type Activity } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHeatmapData } from "@/lib/hooks/useHeatmapData";
import { cn } from "@/lib/utils";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface ActivityHeatmapProps {
  className?: string;
}

export function ActivityHeatmap({ className }: ActivityHeatmapProps) {
  const { data, isLoading, maxValue, activeDays } = useHeatmapData();
  const { resolvedTheme } = useTheme();

  // Transform data to react-activity-calendar format
  const calendarData: Activity[] = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((d) => ({
      date: d.date,
      count: d.combined,
      level: d.combined === 0 ? 0 : Math.min(Math.ceil((d.combined / maxValue.combined) * 4), 4) as 0 | 1 | 2 | 3 | 4,
    }));
  }, [data, maxValue.combined]);

  // Monochromatic Kanso theme (brand color scale)
  const theme = useMemo(() => ({
    dark: [
      "#262626",                    // Level 0 - empty (muted)
      "hsl(220, 44%, 80%)",        // Level 1
      "hsl(220, 44%, 70%)",        // Level 2
      "hsl(220, 44%, 60%)",        // Level 3
      "hsl(var(--brand))",         // Level 4 - max (brand)
    ],
    light: [
      "#ebebeb",                    // Level 0 - empty (muted)
      "hsl(220, 44%, 80%)",        // Level 1
      "hsl(220, 44%, 70%)",        // Level 2
      "hsl(220, 44%, 60%)",        // Level 3
      "hsl(var(--brand))",         // Level 4 - max (brand)
    ],
  }), []);

  // Custom tooltip render function
  const renderTooltip = (activity: Activity) => {
    const point = data.find((d) => d.date === activity.date);
    if (!point) return activity.date;
    return `${activity.date}: ${point.focus}h focus • ${point.tasks} tasks`;
  };

  if (isLoading) {
    return (
      <Card className={cn("p-6 border-border/50", className)}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 border-border/50 overflow-hidden", className)}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Activity Heatmap
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {activeDays} active days in the past year
            </p>
          </div>
        </div>

        <div className="relative flex flex-col items-center">
          <div className="w-full overflow-x-auto pb-4 custom-scrollbar flex justify-start md:justify-center">
            <ActivityCalendar
              data={calendarData}
              theme={theme}
              colorScheme={(resolvedTheme as "light" | "dark") || "light"}
              blockSize={15}
              blockMargin={5}
              blockRadius={2}
              fontSize={13}
              showColorLegend={true}
              showMonthLabels={true}
              showTotalCount={false}
              labels={{
                months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                legend: {
                  less: "Less",
                  more: "More",
                },
              }}
              renderBlock={(block, activity) => (
                <g data-tooltip-id="activity-tooltip" data-tooltip-content={renderTooltip(activity)}>
                  {block}
                </g>
              )}
            />
          </div>
          <ReactTooltip id="activity-tooltip" />
        </div>
      </div>
    </Card>
  );
}
