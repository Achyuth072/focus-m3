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
  bufferCount = 3,
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

  // Sync state changes -> Motion value (Only for external changes)
  const isDragging = useRef(false);
  useEffect(() => {
    if (isDragging.current) return;
    
    const currentIndex = items.indexOf(value);
    const mappedIndex = Math.floor(Math.abs(y.get()) / itemHeight) % items.length;
    
    // Only animate if significant difference preventing jitter
    if (currentIndex !== mappedIndex) {
       const currentPos = y.get();
       const targetBase = Math.floor(currentPos / (items.length * itemHeight)) * (items.length * itemHeight);
       const targetPos = targetBase - (currentIndex * itemHeight);
       animate(y, targetPos, { type: "spring", stiffness: 400, damping: 40 });
    }
  }, [value, items, itemHeight, y]); // Check deps

  // Haptics & Infinite Loop Logic
  useEffect(() => {
    return y.on("change", (v) => {
      // Infinite Loop Check
      const minPos = -((bufferCount - 1) * items.length * itemHeight);
      const maxPos = -(items.length * itemHeight);
      if (v < minPos || v > maxPos) {
         // Teleport logic would need to be careful not to break momentum
         // For now, simpler boundaries or just large buffer is safer
         // But let's rely on the buffer being large enough for typical flicks
      }

      const index = Math.round(-v / itemHeight);
      if (index !== lastIndex.current) {
        lastIndex.current = index;
        
        // Haptics
        const velocity = y.getVelocity();
        const now = Date.now();
        if (now - lastHapticTime.current > 15) {
           const intensity = Math.min(10, Math.max(1, Math.floor(Math.abs(velocity) / 100)));
           trigger(intensity);
           lastHapticTime.current = now;
        }
      }
    });
  }, [itemHeight, trigger, bufferCount, items.length, y]);

  // Handle final selection when animation settles
  const handleUpdate = (latest: any) => {
      // We could trigger onChange here but it might be too frequent
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl cursor-grab active:cursor-grabbing touch-none select-none",
        className
      )}
      style={{ height, perspective: 1000 }}
      onPointerDown={(e) => { e.stopPropagation(); isDragging.current = true; }}
      onTouchStart={(e) => { e.stopPropagation(); isDragging.current = true; }}
      onPointerUp={() => { isDragging.current = false; }}
    >
      <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-10 border-y border-border/40 z-0 pointer-events-none" />
      
      <motion.div
        drag="y"
        dragElastic={0.1}
        dragMomentum={true} // Enable free momentum
        dragTransition={{
          power: 0.3, // Scrolling "feel"
          timeConstant: 200,
          modifyTarget: (target) => {
            // Native Snap-to-Grid
            const snapped = Math.round(target / itemHeight) * itemHeight;
            return snapped;
          }
        }}
        onDragEnd={() => {
           isDragging.current = false;
        }}
        onUpdate={(latest) => {
           // Optional: check if stuck between grids? Framer usually handles this.
        }}
        // Detect settlement to fire onChange
        onAnimationComplete={() => {
            const finalY = y.get();
            const finalIndex = Math.round(-finalY / itemHeight);
            const actualValue = items[finalIndex % items.length];
            // Only fire if changed
            if (actualValue !== value) onChange(actualValue);
        }}
        style={{ y }}
        className="flex flex-col items-center py-[60px] will-change-transform"
      >
        {Array.from({ length: totalItems }).map((_, i) => {
          const item = items[i % items.length];
          // Determine distance from center for this item
          const relativeY = useTransform(y, (latestY) => {
            const itemPos = i * itemHeight;
            return itemPos + latestY;
          });
          
          const rotationX = useTransform(relativeY, (val) => {
             const angle = (val / (height / 2)) * -40;
             return Math.max(-90, Math.min(90, angle));
          });

          const opacity = useTransform(relativeY, (val) => {
             return 1 - Math.abs(val) / (height * 0.8);
          });
          
          const scale = useTransform(relativeY, (val) => {
             const dist = Math.abs(val);
             // Scale up center item
             return 1 - (dist / height) * 0.3; 
          });

          const color = useTransform(relativeY, (val) => {
             if (Math.abs(val) < itemHeight / 2) return "var(--primary)"; // Active color
             return "var(--muted-foreground)"; // Inactive
          });
          
          const fontWeight = useTransform(relativeY, (val) => {
             if (Math.abs(val) < itemHeight / 2) return 600;
             return 400;
          });

          return (
            <motion.div
              key={i}
              style={{ 
                height: itemHeight,
                rotateX: rotationX,
                opacity,
                scale,
                color,
                fontWeight, // Does framer support font-weight interpolation? Yes if numeric.
              }}
              className="w-full flex items-center justify-center tabular-nums backface-invisible text-lg" // Default base styles
            >
              {item}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
