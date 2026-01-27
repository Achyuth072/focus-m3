"use client";

import React, { useEffect, useRef, useMemo } from "react";
// @ts-expect-error - cal-heatmap may have type resolution issues in some environments
import CalHeatmap from "cal-heatmap";
// @ts-expect-error - cal-heatmap plugins may not have types
import Tooltip from "cal-heatmap/plugins/Tooltip";
// @ts-expect-error - cal-heatmap plugins may not have types
import Legend from "cal-heatmap/plugins/Legend";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHeatmapData } from "@/lib/hooks/useHeatmapData";
import { cn } from "@/lib/utils";
import { subDays } from "date-fns";

interface ActivityHeatmapProps {
  className?: string;
}

export function ActivityHeatmap({ className }: ActivityHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, maxValue, activeDays } = useHeatmapData();
  const selectedMetric = "combined";

  const colorScale = useMemo(
    () => [
      "hsl(var(--muted))",
      "hsl(220, 44%, 80%)",
      "hsl(220, 44%, 70%)",
      "hsl(220, 44%, 60%)",
      "hsl(var(--brand))",
    ],
    [],
  );

  const thresholds = useMemo(() => {
    const max = maxValue[selectedMetric];
    if (max <= 1) return [0, 0.25, 0.5, 0.75];
    return [
      0,
      Math.max(1, Math.floor(max * 0.25)),
      Math.max(2, Math.floor(max * 0.5)),
      Math.max(3, Math.floor(max * 0.75)),
    ];
  }, [maxValue, selectedMetric]);

  const startDate = useMemo(() => subDays(new Date(), 364), []);
  const legendId = React.useId().replace(/:/g, "");

  useEffect(() => {
    if (isLoading || !containerRef.current || !data) return;

    // Create a disposable child container specifically for this instance
    const mountPoint = document.createElement("div");
    containerRef.current.appendChild(mountPoint);

    const cal = new CalHeatmap();

    cal.paint(
      {
        itemSelector: mountPoint,
        data: {
          source: data,
          type: "json",
          x: "date",
          y: selectedMetric,
          groupY: "max",
        },
        date: {
          start: startDate,
          timezone: "UTC",
        },
        range: 12,
        scale: {
          color: {
            type: "threshold",
            range: colorScale,
            domain: thresholds,
          },
        },
        domain: {
          type: "month",
          gutter: 8,
          label: {
            text: "MMM",
            position: "bottom",
            offset: { x: 0, y: 5 },
          },
        },
        subDomain: {
          type: "day",
          radius: 2,
          width: 12,
          height: 12,
          gutter: 4,
        },
        itemName: [
          selectedMetric,
          selectedMetric === "tasks"
            ? "tasks"
            : selectedMetric === "focus"
              ? "hours"
              : "points",
        ],
      },
      [
        [
          Tooltip,
          {
            enabled: true,
            text: (
              _date: Date | string | number,
              _value: number | null,
              dayjsDate: { format: (fmt: string) => string },
            ) => {
              const point = data.find(
                (d) => d.date === dayjsDate.format("YYYY-MM-DD"),
              );
              if (!point) return dayjsDate.format("LL");
              return `${dayjsDate.format("LL")}: ${point.focus}h focus • ${point.tasks} tasks`;
            },
          },
        ],
        [
          Legend,
          {
            enabled: true,
            itemSelector: `#${legendId}`,
            label: "Activity Level",
          },
        ],
      ],
    );

    return () => {
      try {
        cal.destroy();
      } catch (e) {
        console.warn("CalHeatmap destroy failed", e);
      }
      if (mountPoint.parentNode) {
        mountPoint.parentNode.removeChild(mountPoint);
      }
    };
  }, [
    data,
    isLoading,
    selectedMetric,
    colorScale,
    thresholds,
    legendId,
    startDate,
  ]);

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
          <div
            ref={containerRef}
            className="w-full overflow-x-auto pb-4 custom-scrollbar flex justify-start md:justify-center"
          >
            {/* CalHeatmap will render here */}
          </div>

          <div className="flex justify-center items-center mt-2 text-[10px] text-muted-foreground w-full">
            <span className="mr-2">Less</span>
            <div id={legendId} className="flex gap-1" />
            <span className="ml-2">More</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
