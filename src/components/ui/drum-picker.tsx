"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  PanInfo,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/lib/hooks/useHaptic";

interface DrumPickerProps {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  height?: number;
  itemHeight?: number;
  className?: string;
}

export function DrumPicker({
  items,
  value,
  onChange,
  height = 160,
  itemHeight = 40,
  className,
  bufferCount = 3, // Reduced default for performance
}: DrumPickerProps & { bufferCount?: number }) {
  const { trigger } = useHaptic();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const totalItems = items.length * bufferCount;
  const middleIndex = Math.floor(bufferCount / 2) * items.length;
  
  const selectedIndex = items.indexOf(value);
  const initialIndex = middleIndex + (selectedIndex >= 0 ? selectedIndex : 0);
  
  const y = useMotionValue(-initialIndex * itemHeight);
  const lastIndex = useRef(initialIndex);

  // Velocity tracking for haptics
  const lastHapticTime = useRef(0);

  // Sync value changes from parent
  useEffect(() => {
    const currentIndex = items.indexOf(value);
    const mappedIndex = Math.floor(Math.abs(y.get()) / itemHeight) % items.length;
    
    if (currentIndex !== mappedIndex) {
      const currentPos = y.get();
      const targetBase = Math.floor(currentPos / (items.length * itemHeight)) * (items.length * itemHeight);
      const targetPos = targetBase - (currentIndex * itemHeight);
      
      animate(y, targetPos, {
        type: "spring",
        stiffness: 400, // Snappier
        damping: 40,
      });
    }
  }, [value, items, itemHeight]);

  // Haptic Feedback on "Tick"
  useEffect(() => {
    return y.on("change", (v) => {
      const index = Math.round(-v / itemHeight);
      if (index !== lastIndex.current) {
        lastIndex.current = index;
        
        // Ratchet Haptic
        const velocity = y.getVelocity();
        const now = Date.now();
        
        // Debounce slightly but allow rapid ticks
        if (now - lastHapticTime.current > 15) {
          // Lower threshold: even slow movement triggers light haptics
          const intensity = Math.min(10, Math.max(1, Math.floor(Math.abs(velocity) / 100)));
          trigger(intensity);
          lastHapticTime.current = now;
        }
      }
    });
  }, [itemHeight, trigger]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const currentY = y.get();
    
    // Inertia calculation
    const targetY = currentY + velocity * 0.15; // More inertia
    const snappedY = Math.round(targetY / itemHeight) * itemHeight;

    animate(y, snappedY, {
      type: "spring",
      stiffness: 250,
      damping: 30,
      velocity: velocity,
      onComplete: () => {
        const finalIndex = Math.round(-snappedY / itemHeight);
        const actualValue = items[finalIndex % items.length];
        onChange(actualValue);

        // Reset to middle buffer if we're drifting too far
        const minPos = -((bufferCount - 1) * items.length * itemHeight);
        const maxPos = -(items.length * itemHeight);
        
        if (snappedY < minPos || snappedY > maxPos) {
          const resetIndex = middleIndex + (finalIndex % items.length);
          y.set(-resetIndex * itemHeight);
        }
      },
    });
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl cursor-grab active:cursor-grabbing touch-none select-none", // Removed bg-secondary/10
        className
      )}
      style={{ height, perspective: 1000 }}
      onPointerDown={(e) => e.stopPropagation()} // Stop drawer dragging
      onTouchStart={(e) => e.stopPropagation()} // Stop drawer dragging (mobile)
    >
      {/* Matte Selection Overlay */}
      <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-10 border-y border-border/40 z-0 pointer-events-none" />
      
      <motion.div
        drag="y"
        dragElastic={0.05} // Stiffer structure
        dragMomentum={false} // We handle momentum manually for snapping
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="flex flex-col items-center py-[60px] will-change-transform" // optimizations
      >
        {Array.from({ length: totalItems }).map((_, i) => {
          const item = items[i % items.length];
          // Optimization: Simple transforms, no complex opacity/scale if not needed
          // Keeping 3D effect but optimized
          
          const relativeY = useTransform(y, (v) => i * itemHeight + v);
          
          const rotationX = useTransform(y, (v) => {
            const pos = i * itemHeight + v;
            // Only calculate for visible items? No easy way in Framer Motion without layout shift
            // Clamp rotation to avoid useless calcs?
            const val = (pos / (height / 2)) * -40;
            return Math.max(-90, Math.min(90, val));
          });

          const opacity = useTransform(y, (v) => {
             const pos = i * itemHeight + v;
             return 1 - Math.abs(pos) / (height * 0.8);
          });
          
          // Removed scale for perf

          return (
            <motion.div
              key={i}
              style={{ 
                height: itemHeight,
                rotateX: rotationX,
                opacity,
              }}
              className={cn(
                "w-full flex items-center justify-center tabular-nums transition-colors backface-invisible",
                value === item 
                  ? "text-2xl font-semibold text-primary" // Larger active font
                  : "text-lg text-muted-foreground/40" // Muted inactive
              )}
            >
              {item}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
