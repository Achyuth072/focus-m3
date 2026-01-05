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
  const isMomentum = useRef(false); // Track momentum phase

  useEffect(() => {
    // Prevent interfering if user is actively interacting (Drag or Momentum)
    if (isDragging.current || isMomentum.current) return;
    
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
      
      // Safety check for NaN or Infinity which causes blanking
      if (!Number.isFinite(v)) {
          console.warn("DrumPicker: y value corrupted", v);
          y.set(-initialIndex * itemHeight); // Emergency Reset
          return;
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

  // Handle final selection when animation/momentum settles
  const handleSettled = () => {
      isMomentum.current = false; // Momentum finished

      const finalY = y.get();
      const itemLength = items.length;
      const heightStep = itemHeight;
      const totalHeight = itemLength * heightStep;
      
      const finalIndex = Math.round(-finalY / heightStep);
      
      // Fix Modulo Bug: Handle negative indices correctly
      const wrappedIndex = ((finalIndex % itemLength) + itemLength) % itemLength;
      const actualValue = items[wrappedIndex];
      
      // Fire Change
      if (actualValue && actualValue !== value) {
          onChange(actualValue);
      } else if (!actualValue) {
          // Fallback if something went wrong
          console.error("DrumPicker: selection out of bounds", wrappedIndex);
      }

      // Infinite Loop Reset: Teleport to middle buffer if near edges
      // We want to keep the user in the center buffer (e.g. buffer index 1 of 0,1,2)
      // center range is approximately: middleIndex +/- itemLength/2
      const currentBufferIndex = Math.floor(finalIndex / itemLength);
      const targetBufferIndex = Math.floor(bufferCount / 2);
      
      if (currentBufferIndex !== targetBufferIndex) {
          // Calculate offset to jump back to center without visual shift
          const offsetDist = (currentBufferIndex - targetBufferIndex) * totalHeight;
          y.set(finalY + offsetDist);
      }
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
        dragMomentum={true}
        dragTransition={{
          power: 0.3, 
          timeConstant: 200,
          modifyTarget: (target) => {
            const snapped = Math.round(target / itemHeight) * itemHeight;
            return snapped;
          }
        }}
        onDragEnd={() => { 
            isDragging.current = false; 
            isMomentum.current = true; // Start momentum tracking
        }}
        onDragTransitionEnd={handleSettled} // Fires after drag momentum ends
        onAnimationComplete={(def) => {
            // Only handle if it's a programmatic animation (not drag/momentum)
            if (!isDragging.current && !isMomentum.current) handleSettled();
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
