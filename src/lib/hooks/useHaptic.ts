"use client";

import { useUiStore } from "@/lib/store/uiStore";
import { useMediaQuery } from "./useMediaQuery";

export function useHaptic() {
  const { hapticsEnabled } = useUiStore();
  const isPhone = useMediaQuery(
    "(max-width: 640px) or ((hover: none) and (pointer: coarse))"
  );

  const trigger = (pattern: number | number[] = 50) => {
    if (
      hapticsEnabled &&
      isPhone &&
      typeof navigator !== "undefined" &&
      navigator.vibrate
    ) {
      navigator.vibrate(pattern);
    }
  };

  return {
    trigger,
    isPhone,
    hapticsEnabled,
  };
}
