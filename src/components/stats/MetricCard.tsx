"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("p-4 md:p-6 border-border/80", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 md:space-y-2">
          <p className="type-ui uppercase text-[10px] md:text-xs text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl md:text-4xl font-semibold tracking-[-0.02em]">
            {value}
          </p>
          {trend && (
            <div
              className={cn(
                "text-[10px] md:text-xs font-medium flex items-center gap-1",
                trend.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-1.5 md:p-2 rounded-lg bg-secondary/30">
            <Icon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground/70" />
          </div>
        )}
      </div>
    </Card>
  );
}
