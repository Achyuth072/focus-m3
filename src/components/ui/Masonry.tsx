import React from "react";
import { cn } from "@/lib/utils";

interface MasonryProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  className?: string;
  columnClassName?: string;
  gap?: number | string;
}

/**
 * A simple masonry-style layout component using CSS grid and column filtering.
 * Follows the Zen-Modernism principles of structured columns and balanced "Ma" (whitespace).
 */
export function Masonry<T>({
  items,
  renderItem,
  className,
  columnClassName,
  gap = 4,
}: MasonryProps<T>) {
  if (!items.length) return null;

  const gapClass = typeof gap === "number" ? `gap-${gap}` : gap;

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        gapClass,
        className,
      )}
    >
      {/* Column 1 (Always visible) */}
      <div className={cn("flex flex-col", gapClass, columnClassName)}>
        {items
          .filter((_, i) => i % 3 === 0 || (items.length < 3 && i % 2 === 0))
          .map((item, idx) => (
            <React.Fragment key={idx}>{renderItem(item)}</React.Fragment>
          ))}
      </div>

      {/* Column 2 (Visible on sm+) */}
      <div className={cn("hidden sm:flex flex-col", gapClass, columnClassName)}>
        {items
          .filter((_, i) => (items.length >= 3 ? i % 3 === 1 : i % 2 === 1))
          .map((item, idx) => (
            <React.Fragment key={idx}>{renderItem(item)}</React.Fragment>
          ))}
      </div>

      {/* Column 3 (Visible on lg+) */}
      <div className={cn("hidden lg:flex flex-col", gapClass, columnClassName)}>
        {items
          .filter((_, i) => i % 3 === 2)
          .map((item, idx) => (
            <React.Fragment key={idx}>{renderItem(item)}</React.Fragment>
          ))}
      </div>
    </div>
  );
}
