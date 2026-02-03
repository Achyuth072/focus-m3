import React from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableTaskContentProps {
  children: React.ReactNode;
  isDesktop: boolean;
  isDragging: boolean;
  viewMode: "list" | "grid" | "board";
  isHandleActive: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  className?: string;
  onClick?: () => void;
}

const SWIPE_THRESHOLD = 150;
const SCHEDULE_SWIPE_THRESHOLD = 100;

export function SwipeableTaskContent({
  children,
  isDesktop,
  isDragging,
  viewMode,
  isHandleActive,
  onSwipeLeft,
  onSwipeRight,
  onSwipeStart,
  onSwipeEnd,
  className,
  onClick,
}: SwipeableTaskContentProps) {
  const x = useMotionValue(0);

  const background = useTransform(
    x,
    [-SWIPE_THRESHOLD, -50, 0, 50, SCHEDULE_SWIPE_THRESHOLD],
    [
      "hsl(0 84.2% 60.2%)",
      "hsl(0 84.2% 60.2% / 0.3)",
      "transparent",
      "hsl(220 44% 50% / 0.3)",
      "hsl(220 44% 50%)",
    ],
  );

  const leftIconOpacity = useTransform(x, [10, 40], [0, 1]);
  const rightIconOpacity = useTransform(x, [-40, -10], [1, 0]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    onSwipeEnd?.();
    if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipeLeft();
    } else if (info.offset.x > SCHEDULE_SWIPE_THRESHOLD) {
      onSwipeRight();
    }
  };

  return (
    <motion.div
      style={{ background }}
      className={cn("relative", isDesktop ? "rounded-md" : "overflow-hidden")}
    >
      {/* Swipe indicators */}
      <motion.div
        style={{ opacity: rightIconOpacity }}
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 text-white pointer-events-none"
      >
        <Trash2 className="h-5 w-5" />
      </motion.div>
      <motion.div
        style={{ opacity: leftIconOpacity }}
        className="absolute inset-y-0 left-0 flex items-center justify-start pl-4 text-white pointer-events-none"
      >
        <Pencil className="h-5 w-5" />
      </motion.div>

      {/* Main content */}
      <motion.div
        style={{ x }}
        drag={
          isDesktop || isDragging || viewMode === "board" || isHandleActive
            ? false
            : "x"
        }
        dragDirectionLock
        dragConstraints={{
          left: -SWIPE_THRESHOLD * 1.2,
          right: SCHEDULE_SWIPE_THRESHOLD * 1.2,
        }}
        dragElastic={{ left: 0.2, right: 0.2 }}
        dragMomentum={false}
        dragSnapToOrigin={true}
        onDragStart={onSwipeStart}
        onDragEnd={handleDragEnd}
        className={className}
        onClick={onClick}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
