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
}: DrumPickerProps) {
  const { trigger } = useHaptic();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create a large number of items for infinite effect
  const BUFFER_COUNT = 5; // Total 5x items
  const totalItems = items.length * BUFFER_COUNT;
  const middleIndex = Math.floor(BUFFER_COUNT / 2) * items.length;
  
  const selectedIndex = items.indexOf(value);
  const initialIndex = middleIndex + (selectedIndex >= 0 ? selectedIndex : 0);
  
  const y = useMotionValue(-initialIndex * itemHeight);
  const lastIndex = useRef(initialIndex);

  // Velocity tracking for haptics
  const lastHapticTime = useRef(0);

  // Sync value changes from parent (e.g. if another picker changes AM/PM)
  useEffect(() => {
    const currentIndex = items.indexOf(value);
    const mappedIndex = Math.floor(Math.abs(y.get()) / itemHeight) % items.length;
    
    if (currentIndex !== mappedIndex) {
      const currentPos = y.get();
      const targetBase = Math.floor(currentPos / (items.length * itemHeight)) * (items.length * itemHeight);
      const targetPos = targetBase - (currentIndex * itemHeight);
      
      animate(y, targetPos, {
        type: "spring",
        stiffness: 300,
        damping: 30,
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
        
        // Prevent too many haptics (debounce)
        if (now - lastHapticTime.current > 10) {
          // Scale haptic duration based on velocity (2ms - 8ms)
          const duration = Math.min(8, Math.max(2, Math.floor(Math.abs(velocity) / 200)));
          trigger(duration);
          lastHapticTime.current = now;
        }
      }
    });
  }, [itemHeight, trigger]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const currentY = y.get();
    
    // Inertia calculation
    const targetY = currentY + velocity * 0.1;
    const snappedY = Math.round(targetY / itemHeight) * itemHeight;

    animate(y, snappedY, {
      type: "spring",
      stiffness: 200,
      damping: 25,
      velocity: velocity,
      onComplete: () => {
        const finalIndex = Math.round(-snappedY / itemHeight);
        const actualValue = items[finalIndex % items.length];
        onChange(actualValue);

        // Reset to middle buffer if we're drifting too far
        const minPos = -((BUFFER_COUNT - 1) * items.length * itemHeight);
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
        "relative flex flex-col overflow-hidden bg-secondary/10 rounded-xl cursor-grab active:cursor-grabbing",
        className
      )}
      style={{ height, perspective: 1000 }}
    >
      {/* Selection Overlay */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-background/50 border-y border-primary/20 z-0 pointer-events-none" />
      
      <motion.div
        drag="y"
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="flex flex-col items-center py-[60px]"
      >
        {Array.from({ length: totalItems }).map((_, i) => {
          const item = items[i % items.length];
          const relativeY = useTransform(y, (v) => {
            const pos = i * itemHeight + v;
            return pos;
          });

          // 3D "Drum" Effect
          const rotationX = useTransform(y, (v) => {
            const pos = i * itemHeight + v;
            const centerOffset = pos / (height / 2);
            return centerOffset * -45; // Max 45 degree tilt
          });

          const opacity = useTransform(y, (v) => {
            const pos = i * itemHeight + v;
            const distance = Math.abs(pos);
            return Math.max(0.1, 1 - (distance / (height / 1.5)));
          });

          const scale = useTransform(y, (v) => {
            const pos = i * itemHeight + v;
            const distance = Math.abs(pos);
            return Math.max(0.8, 1 - (distance / (height * 2)));
          });

          return (
            <motion.div
              key={i}
              style={{ 
                height: itemHeight,
                rotateX: rotationX,
                opacity,
                scale,
              }}
              className={cn(
                "w-full flex items-center justify-center text-lg tabular-nums transition-colors",
                value === item ? "text-primary font-bold" : "text-muted-foreground"
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
