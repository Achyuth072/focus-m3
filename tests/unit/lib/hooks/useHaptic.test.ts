import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { useUiStore } from "@/lib/store/uiStore";

// Mock dependencies
vi.mock("@/lib/store/uiStore", () => ({
  useUiStore: vi.fn(),
}));

const mockIsPhone = vi.fn(() => true);
vi.mock("@/lib/hooks/useMediaQuery", () => ({
  useMediaQuery: () => mockIsPhone(),
}));

describe("useHaptic", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup navigator.vibrate mock
    if (typeof window !== "undefined") {
      Object.defineProperty(window.navigator, "vibrate", {
        writable: true,
        value: vi.fn(),
      });
    }

    // Default to enabled
    (useUiStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      hapticsEnabled: true,
    });
  });

  it("should trigger vibration when enabled and on phone", () => {
    // Given: haptics enabled and environment is a phone
    mockIsPhone.mockReturnValue(true);
    const { result } = renderHook(() => useHaptic());

    // When: trigger is called with a pattern
    result.current.trigger(15);

    // Then: navigator.vibrate should be called with that pattern
    expect(window.navigator.vibrate).toHaveBeenCalledWith(15);
  });

  it("should NOT trigger vibration when disabled in settings", () => {
    // Given: haptics disabled in store
    (useUiStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      hapticsEnabled: false,
    });
    mockIsPhone.mockReturnValue(true);
    const { result } = renderHook(() => useHaptic());

    // When: trigger is called
    result.current.trigger(50);

    // Then: navigator.vibrate should NOT be called
    expect(window.navigator.vibrate).not.toHaveBeenCalled();
  });

  it("should NOT trigger vibration when NOT on a phone (desktop)", () => {
    // Given: haptics enabled but environment is NOT a phone
    (useUiStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      hapticsEnabled: true,
    });
    mockIsPhone.mockReturnValue(false);
    const { result } = renderHook(() => useHaptic());

    // When: trigger is called
    result.current.trigger(10);

    // Then: navigator.vibrate should NOT be called
    expect(window.navigator.vibrate).not.toHaveBeenCalled();
  });

  it("should handle array patterns for signature haptics", () => {
    // Given: signatures enabled
    mockIsPhone.mockReturnValue(true);
    const { result } = renderHook(() => useHaptic());

    // When: trigger is called with an array
    const pattern = [10, 30, 10];
    result.current.trigger(pattern);

    // Then: navigator.vibrate should be called with the array
    expect(window.navigator.vibrate).toHaveBeenCalledWith(pattern);
  });
});
