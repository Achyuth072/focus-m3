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
    <Card className={cn("p-6 border-border/50", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-serif text-sm font-medium text-foreground/60 italic lowercase">
            {title}
          </p>
          <p className="text-4xl font-serif font-bold tracking-tight text-foreground">
            {value}
          </p>
          {trend && (
            <div
              className={cn(
                "text-[10px] font-mono flex items-center gap-1",
                trend.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span className="tabular-nums">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-md bg-foreground/5">
            <Icon className="h-5 w-5 text-foreground/80" strokeWidth={2.25} />
          </div>
        )}
      </div>
    </Card>
  );
}
