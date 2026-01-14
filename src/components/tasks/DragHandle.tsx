import React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";

interface DragHandleProps {
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
  variant?: "desktop" | "mobile";
}

export function DragHandle({
  dragListeners,
  dragAttributes,
  variant = "desktop",
}: DragHandleProps) {
  const isDesktop = variant === "desktop";

  return (
    <div
      {...dragListeners}
      {...dragAttributes}
      onPointerDown={(e) => {
        e.stopPropagation();
        dragListeners?.onPointerDown?.(e);
      }}
      className={cn(
        "cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-opacity",
        isDesktop ? "opacity-0 group-hover:opacity-100" : "shrink-0"
      )}
      style={isDesktop ? undefined : { touchAction: "none" }}
    >
      <GripVertical className={cn(isDesktop ? "h-4 w-4" : "h-5 w-5")} />
    </div>
  );
}
