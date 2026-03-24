"use client";

import { useCallback } from "react";
import { useUiStore } from "@/lib/store/uiStore";
import { useMediaQuery } from "./useMediaQuery";
import { HAPTIC_PATTERNS, HapticPattern } from "@/lib/constants/haptics";

export function useHaptic() {
  const { hapticsEnabled } = useUiStore();
  const isPhone = useMediaQuery(
    "(max-width: 640px) or ((hover: none) and (pointer: coarse))",
  );

  const trigger = useCallback(
    (pattern: HapticPattern | number | number[] = "HEAVY") => {
      if (
        hapticsEnabled &&
        isPhone &&
        typeof navigator !== "undefined" &&
        navigator.vibrate
      ) {
        const vibrationPattern =
          typeof pattern === "number" || Array.isArray(pattern)
            ? pattern
            : HAPTIC_PATTERNS[pattern as HapticPattern];
        navigator.vibrate(vibrationPattern as number | number[]);
      }
    },
    [hapticsEnabled, isPhone],
  );

  return {
    trigger,
    isPhone,
    hapticsEnabled,
  };
}
