"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LargeTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function LargeTimePicker({
  value,
  onChange,
  className,
}: LargeTimePickerProps) {
  const hours12 = value.getHours() % 12 || 12;
  const minutes = value.getMinutes();
  const isPM = value.getHours() >= 12;

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const ITEM_HEIGHT = 48;
  const HOUR_COUNT = 12;
  const MINUTE_COUNT = 60;
  
  // Triple buffers for infinite scroll
  const hours = Array.from({ length: HOUR_COUNT * 3 }, (_, i) => (i % HOUR_COUNT) + 1);
  const mins = Array.from({ length: MINUTE_COUNT * 3 }, (_, i) => i % MINUTE_COUNT);

  // Store onChange in a ref to avoid recreating handlers
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Track last emitted values to prevent redundant updates
  const lastHourRef = useRef(hours12);
  const lastMinuteRef = useRef(minutes);
  const lastPeriodRef = useRef(isPM);

  const isAdjusting = useRef(false);

  // Initialize scroll positions to middle buffer on mount
  useEffect(() => {
    if (hourRef.current) {
      hourRef.current.scrollTop = (HOUR_COUNT + hours12 - 1) * ITEM_HEIGHT;
    }
    if (minuteRef.current) {
      minuteRef.current.scrollTop = (MINUTE_COUNT + minutes) * ITEM_HEIGHT;
    }
    if (periodRef.current) {
      periodRef.current.scrollTop = (isPM ? 1 : 0) * ITEM_HEIGHT;
    }
  }, []); // Only on mount

  // Draggable scroll hook
  const useDraggableScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      let isDragging = false;
      let startY = 0;
      let startScrollTop = 0;

      const onPointerDown = (e: PointerEvent) => {
        isDragging = true;
        startY = e.clientY;
        startScrollTop = el.scrollTop;
        el.setPointerCapture(e.pointerId);
        el.style.cursor = 'grabbing';
        el.style.scrollSnapType = 'none';
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const delta = e.clientY - startY;
        el.scrollTop = startScrollTop - delta;
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;
        el.releasePointerCapture(e.pointerId);
        el.style.cursor = 'grab';
        el.style.scrollSnapType = 'y mandatory';
      };

      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointermove', onPointerMove);
      el.addEventListener('pointerup', onPointerUp);
      el.addEventListener('pointercancel', onPointerUp);

      return () => {
        el.removeEventListener('pointerdown', onPointerDown);
        el.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerup', onPointerUp);
        el.removeEventListener('pointercancel', onPointerUp);
      };
    }, []);
  };

  useDraggableScroll(hourRef);
  useDraggableScroll(minuteRef);
  useDraggableScroll(periodRef);

  // Infinite Scroll "Teleport" Reset Logic
  const handleInfiniteScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    count: number
  ) => {
    const el = ref.current;
    if (!el || isAdjusting.current) return;

    const scrollPos = el.scrollTop;
    const minScroll = count * ITEM_HEIGHT;
    const maxScroll = count * 2 * ITEM_HEIGHT;

    if (scrollPos < minScroll - (ITEM_HEIGHT * 2)) {
      isAdjusting.current = true;
      el.scrollTop = scrollPos + minScroll;
      setTimeout(() => { isAdjusting.current = false; }, 50);
    } else if (scrollPos > maxScroll + (ITEM_HEIGHT * 2)) {
      isAdjusting.current = true;
      el.scrollTop = scrollPos - minScroll;
      setTimeout(() => { isAdjusting.current = false; }, 50);
    }
  };

  const handleHourScroll = () => {
    if (!hourRef.current) return;
    handleInfiniteScroll(hourRef, HOUR_COUNT);
    
    const scrollPos = hourRef.current.scrollTop;
    const index = Math.round(scrollPos / ITEM_HEIGHT);
    const hourValue = (index % HOUR_COUNT) + 1;

    if (hourValue !== lastHourRef.current) {
      lastHourRef.current = hourValue;
      const newDate = new Date(value);
      const hours24 = isPM
        ? hourValue === 12 ? 12 : hourValue + 12
        : hourValue === 12 ? 0 : hourValue;
      newDate.setHours(hours24);
      onChangeRef.current(newDate);
      if (navigator.vibrate) navigator.vibrate(5);
    }
  };

  const handleMinuteScroll = () => {
    if (!minuteRef.current) return;
    handleInfiniteScroll(minuteRef, MINUTE_COUNT);

    const scrollPos = minuteRef.current.scrollTop;
    const index = Math.round(scrollPos / ITEM_HEIGHT);
    const minuteValue = index % MINUTE_COUNT;

    if (minuteValue !== lastMinuteRef.current) {
      lastMinuteRef.current = minuteValue;
      const newDate = new Date(value);
      newDate.setMinutes(minuteValue);
      onChangeRef.current(newDate);
      if (navigator.vibrate) navigator.vibrate(5);
    }
  };

  const handlePeriodScroll = () => {
    if (!periodRef.current) return;
    const index = Math.round(periodRef.current.scrollTop / ITEM_HEIGHT);
    const pm = index === 1;
    if (pm !== lastPeriodRef.current) {
      lastPeriodRef.current = pm;
      const newDate = new Date(value);
      const currentHour = value.getHours();
      if (pm && currentHour < 12) {
        newDate.setHours(currentHour + 12);
      } else if (!pm && currentHour >= 12) {
        newDate.setHours(currentHour - 12);
      }
      onChangeRef.current(newDate);
      if (navigator.vibrate) navigator.vibrate(5);
    }
  };

  const hourScrollTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const minuteScrollTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const periodScrollTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onHourScroll = () => {
    clearTimeout(hourScrollTimeout.current);
    hourScrollTimeout.current = setTimeout(handleHourScroll, 50);
  };

  const onMinuteScroll = () => {
    clearTimeout(minuteScrollTimeout.current);
    minuteScrollTimeout.current = setTimeout(handleMinuteScroll, 50);
  };

  const onPeriodScroll = () => {
    clearTimeout(periodScrollTimeout.current);
    periodScrollTimeout.current = setTimeout(handlePeriodScroll, 50);
  };

  const handleWheel = (e: React.WheelEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      e.preventDefault();
      const moveAmount = Math.abs(e.deltaY) < ITEM_HEIGHT 
        ? e.deltaY 
        : Math.sign(e.deltaY) * ITEM_HEIGHT;
      ref.current.scrollTop += moveAmount;
    }
  };

  return (
    <div className={cn('grid grid-cols-3 gap-2 h-[160px] w-[280px] mx-auto select-none', className)}>
      <div className="relative flex flex-col overflow-hidden bg-secondary/30 rounded-lg">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-background/80 border-y border-primary/20 z-0 pointer-events-none" />
        <div 
          ref={hourRef}
          onScroll={onHourScroll}
          onWheel={(e) => handleWheel(e, hourRef)}
          className="overflow-y-auto snap-y snap-mandatory scrollbar-hide py-[56px] h-full z-10 overscroll-contain cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'pan-y' }}
        >
          {hours.map((hour, i) => (
            <div
              key={`${hour}-${i}`}
              className={cn(
                'h-12 flex items-center justify-center text-lg tabular-nums snap-center snap-always transition-colors',
                hours12 === hour 
                  ? 'text-primary font-semibold' 
                  : 'text-muted-foreground/60'
              )}
            >
              {hour}
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col overflow-hidden bg-secondary/30 rounded-lg">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-background/80 border-y border-primary/20 z-0 pointer-events-none" />
        <div 
          ref={minuteRef}
          onScroll={onMinuteScroll}
          onWheel={(e) => handleWheel(e, minuteRef)}
          className="overflow-y-auto snap-y snap-mandatory scrollbar-hide py-[56px] h-full z-10 overscroll-contain cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'pan-y' }}
        >
          {mins.map((minute, i) => (
            <div
              key={`${minute}-${i}`}
              className={cn(
                'h-12 flex items-center justify-center text-lg tabular-nums snap-center snap-always transition-colors',
                minutes === minute 
                  ? 'text-primary font-semibold' 
                  : 'text-muted-foreground/60'
              )}
            >
              {minute.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col overflow-hidden bg-secondary/30 rounded-lg">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-background/80 border-y border-primary/20 z-0 pointer-events-none" />
        <div 
          ref={periodRef}
          onScroll={onPeriodScroll}
          onWheel={(e) => handleWheel(e, periodRef)}
          className="overflow-y-auto snap-y snap-mandatory scrollbar-hide py-[56px] h-full z-10 overscroll-contain cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'pan-y' }}
        >
          {['AM', 'PM'].map((period) => (
            <div
              key={period}
              className={cn(
                'h-12 flex items-center justify-center text-lg font-medium snap-center snap-always transition-colors',
                (period === 'AM' && !isPM) || (period === 'PM' && isPM)
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground/40'
              )}
            >
              {period}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
