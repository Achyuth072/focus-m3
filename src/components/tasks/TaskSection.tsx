"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TaskSectionProps {
  title?: string;
  count?: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "muted";
  className?: string;
  id?: string;
}

/**
 * TaskSection enforces "Ma" (spacing) and "Shodo" (typography) principles
 * for groups of tasks within the List view.
 *
 * - Enforces "The Pause" (32px top margin)
 * - Enforces "The Separator" (8px vertical stack)
 * - Applies typography tokens (type-h3, type-micro)
 */
export function TaskSection({
  title,
  count,
  icon,
  children,
  variant = "default",
  className,
  id,
}: TaskSectionProps) {
  return (
    <div id={id} className={cn("mt-8 first:mt-2", className)}>
      {title && (
        <div className="flex items-baseline gap-2 px-1 mb-2">
          <h3
            className={cn(
              "type-h3 tracking-tight",
              variant === "muted"
                ? "text-muted-foreground/70"
                : "text-foreground/70",
            )}
          >
            {icon && <span className="mr-1.5 inline-block">{icon}</span>}
            {title}
          </h3>
          {count !== undefined && (
            <span className="type-micro text-muted-foreground font-medium">
              ({count})
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "flex flex-col",
          "space-y-0 md:space-y-2", // Mobile: Stacked, Desktop: Spaced (8px)
          "mobile-group-container", // Custom logic below or just classes
          variant === "muted" && "opacity-60",
        )}
      >
        <div className="md:contents rounded-xl border border-border/40 md:border-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export default React.memo(TaskSection);
