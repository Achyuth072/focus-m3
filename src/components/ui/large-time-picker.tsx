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

  const scrollToSelected = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    index: number,
    itemHeight: number
  ) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * itemHeight,
        behavior: "smooth",
      });
    }
  };


  const handleHourChange = (hour: number) => {
    const newDate = new Date(value);
    const hours24 = isPM
      ? hour === 12
        ? 12
        : hour + 12
      : hour === 12
      ? 0
      : hour;
    newDate.setHours(hours24);
    onChange(newDate);
  };

  const handleMinuteChange = (minute: number) => {
    const newDate = new Date(value);
    newDate.setMinutes(minute);
    onChange(newDate);
  };

  const handlePeriodChange = (pm: boolean) => {
    const newDate = new Date(value);
    const currentHour = value.getHours();
    if (pm && currentHour < 12) {
      newDate.setHours(currentHour + 12);
    } else if (!pm && currentHour >= 12) {
      newDate.setHours(currentHour - 12);
    }
    onChange(newDate);
  };

  // Scroll-to-select: Update value when scrolling stops
  useEffect(() => {
    const itemHeight = 48;
    
    const handleScroll = (
      containerRef: React.RefObject<HTMLDivElement | null>,
      type: 'hour' | 'minute' | 'period'
    ) => {
      if (!containerRef.current) return;
      
      const scrollTop = containerRef.current.scrollTop;
      const centerIndex = Math.round(scrollTop / itemHeight);
      
      if (type === 'hour') {
        const hour = centerIndex + 1; // 1-12
        if (hour >= 1 && hour <= 12 && hour !== hours12) {
          handleHourChange(hour);
        }
      } else if (type === 'minute') {
        const minute = centerIndex; // 0-59
        if (minute >= 0 && minute <= 59 && minute !== minutes) {
          handleMinuteChange(minute);
        }
      } else if (type === 'period') {
        const pm = centerIndex === 1;
        if (pm !== isPM) {
          handlePeriodChange(pm);
        }
      }
    };

    let hourTimer: NodeJS.Timeout;
    let minuteTimer: NodeJS.Timeout;
    let periodTimer: NodeJS.Timeout;

    const onHourScroll = () => {
      clearTimeout(hourTimer);
      hourTimer = setTimeout(() => handleScroll(hourRef, 'hour'), 50);
    };

    const onMinuteScroll = () => {
      clearTimeout(minuteTimer);
      minuteTimer = setTimeout(() => handleScroll(minuteRef, 'minute'), 50);
    };

    const onPeriodScroll = () => {
      clearTimeout(periodTimer);
      periodTimer = setTimeout(() => handleScroll(periodRef, 'period'), 50);
    };

    const hourEl = hourRef.current;
    const minuteEl = minuteRef.current;
    const periodEl = periodRef.current;

    hourEl?.addEventListener('scroll', onHourScroll);
    minuteEl?.addEventListener('scroll', onMinuteScroll);
    periodEl?.addEventListener('scroll', onPeriodScroll);

    return () => {
      hourEl?.removeEventListener('scroll', onHourScroll);
      minuteEl?.removeEventListener('scroll', onMinuteScroll);
      periodEl?.removeEventListener('scroll', onPeriodScroll);
      clearTimeout(hourTimer);
      clearTimeout(minuteTimer);
      clearTimeout(periodTimer);
    };
  }, [hours12, minutes, isPM]); // Re-attach when values change

  // Handle manual wheel scrolling for desktop feel
  const handleWheel = (e: React.WheelEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
        ref.current.scrollTop += e.deltaY;
    }
  };

  // Custom hook for drag-to-scroll behavior (Mouse + Touch)
  const useDraggableScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
    const isDragging = useRef(false);
    const startY = useRef(0);
    const startScrollTop = useRef(0);

    const onPointerDown = (e: React.PointerEvent) => {
      if (!ref.current) return;
      isDragging.current = true;
      startY.current = e.clientY;
      startScrollTop.current = ref.current.scrollTop;
      ref.current.setPointerCapture(e.pointerId);
      ref.current.style.cursor = 'grabbing';
      // Disable snap while dragging for smoothness
      ref.current.style.scrollSnapType = 'none';
    };

    const onPointerMove = (e: React.PointerEvent) => {
      if (!isDragging.current || !ref.current) return;
      e.preventDefault();
      const delta = e.clientY - startY.current;
      ref.current.scrollTop = startScrollTop.current - delta;
    };

    const onPointerUp = (e: React.PointerEvent) => {
      if (!ref.current) return;
      isDragging.current = false;
      ref.current.releasePointerCapture(e.pointerId);
      ref.current.style.cursor = 'grab';
      // Re-enable snap after drag
      ref.current.style.scrollSnapType = 'y mandatory';
    };

    return {
      onPointerDown,
      onPointerMove,
      onPointerUp,
    };
  };

  const hourHandlers = useDraggableScroll(hourRef);
  const minuteHandlers = useDraggableScroll(minuteRef);
  const periodHandlers = useDraggableScroll(periodRef);


  return (
    <div className={cn('grid grid-cols-3 gap-1 h-[250px] w-full max-w-[320px] mx-auto select-none touch-pan-y', className)}>
      {/* Hours Column */}
      <div className="relative flex flex-col overflow-hidden bg-secondary/20 rounded-lg">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-background border-y border-primary/20 z-0 pointer-events-none" />
        <div 
          ref={hourRef}
          onWheel={(e) => handleWheel(e, hourRef)}
          {...hourHandlers}
          className="overflow-y-auto snap-y snap-mandatory scrollbar-hide py-[100px] h-full z-10 overscroll-contain cursor-grab"
          style={{ touchAction: 'pan-y' }}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
            <div
              key={hour}
              className={cn(
                'h-12 flex items-center justify-center font-medium text-lg snap-center cursor-pointer transition-opacity pointer-events-none',
                hours12 === hour ? 'text-primary opacity-100 scale-110' : 'text-muted-foreground opacity-40'
              )}
            >
              <span 
                className="pointer-events-auto cursor-pointer w-full h-full flex items-center justify-center"
                onClick={(e) => {
                    e.stopPropagation();
                    handleHourChange(hour);
                    scrollToSelected(hourRef, hour - 1, 48);
                }}
              >
                  {hour}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Minutes Column */}
      <div className="relative flex flex-col overflow-hidden bg-secondary/20 rounded-lg">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-background border-y border-primary/20 z-0 pointer-events-none" />
        <div 
          ref={minuteRef}
          onWheel={(e) => handleWheel(e, minuteRef)}
          {...minuteHandlers}
          className="overflow-y-auto snap-y snap-mandatory scrollbar-hide py-[100px] h-full z-10 overscroll-contain cursor-grab"
          style={{ touchAction: 'pan-y' }}
        >
          {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
            <div
              key={minute}
              className={cn(
                'h-12 flex items-center justify-center font-medium text-lg snap-center cursor-pointer transition-opacity pointer-events-none',
                minutes === minute ? 'text-primary opacity-100 scale-110' : 'text-muted-foreground opacity-40'
              )}
            >
              <span 
                className="pointer-events-auto cursor-pointer w-full h-full flex items-center justify-center"
                onClick={(e) => {
                    e.stopPropagation();
                    handleMinuteChange(minute);
                    scrollToSelected(minuteRef, minute, 48);
                }}
              >
                {minute.toString().padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Period Column */}
      <div className="relative flex flex-col overflow-hidden bg-secondary/20 rounded-lg">
        {/* Center Highlight */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-background border-y border-primary/20 z-0 pointer-events-none" />
        
        <div 
          ref={periodRef}
          onWheel={(e) => handleWheel(e, periodRef)}
          {...periodHandlers}
          className="overflow-y-auto snap-y snap-mandatory scrollbar-hide py-[100px] h-full z-10 overscroll-contain cursor-grab"
          style={{ touchAction: 'pan-y' }}
        >
          {['AM', 'PM'].map((period) => (
            <div
              key={period}
              className={cn(
                'h-12 flex items-center justify-center font-bold text-lg cursor-pointer transition-all snap-center',
                (period === 'AM' && !isPM) || (period === 'PM' && isPM)
                  ? 'text-primary scale-110 opacity-100'
                  : 'text-muted-foreground opacity-30 scale-90'
              )}
              onClick={() => handlePeriodChange(period === 'PM')}
            >
              {period}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
