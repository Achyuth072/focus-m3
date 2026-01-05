"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { DrumPicker } from "./drum-picker";

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

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periodsList = ['AM', 'PM'];

  const handleHourChange = (newHour: string) => {
    const hourValue = parseInt(newHour, 10);
    const newDate = new Date(value);
    const hours24 = isPM
      ? hourValue === 12 ? 12 : hourValue + 12
      : hourValue === 12 ? 0 : hourValue;
    newDate.setHours(hours24);
    onChange(newDate);
  };

  const handleMinuteChange = (newMinute: string) => {
    const minuteValue = parseInt(newMinute, 10);
    const newDate = new Date(value);
    newDate.setMinutes(minuteValue);
    onChange(newDate);
  };

  const handlePeriodChange = (newPeriod: string) => {
    const pm = newPeriod === 'PM';
    if (pm !== isPM) {
      const newDate = new Date(value);
      const currentHour = value.getHours();
      if (pm && currentHour < 12) {
        newDate.setHours(currentHour + 12);
      } else if (!pm && currentHour >= 12) {
        newDate.setHours(currentHour - 12);
      }
      onChange(newDate);
    }
  };

  return (
    <div className={cn('grid grid-cols-3 gap-2 h-[160px] w-[280px] mx-auto', className)}>
      <DrumPicker
        items={hoursList}
        value={hours12.toString()}
        onChange={handleHourChange}
      />
      <DrumPicker
        items={minutesList}
        value={minutes.toString().padStart(2, '0')}
        onChange={handleMinuteChange}
      />
      <DrumPicker
        items={periodsList}
        value={isPM ? 'PM' : 'AM'}
        onChange={handlePeriodChange}
      />
    </div>
  );
}

