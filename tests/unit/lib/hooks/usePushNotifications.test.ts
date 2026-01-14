import { renderHook } from "@testing-library/react";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock store
const mockSetNotificationsEnabled = vi.fn();
vi.mock("@/lib/store/uiStore", () => ({
  useUiStore: vi.fn(() => ({
    notificationsEnabled: true, // Enable to trigger useEffect
    setNotificationsEnabled: mockSetNotificationsEnabled,
  })),
}));

// Mock API
vi.mock("@/lib/push-api", () => ({
  syncPushSubscription: vi.fn(),
  sendPushNotification: vi.fn(),
}));

describe("usePushNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "Notification", {
      value: {
        permission: "granted",
        requestPermission: vi.fn(),
      },
      writable: true,
    });
    // Mock navigator
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(null),
            subscribe: vi.fn().mockResolvedValue({ endpoint: "test" }),
          },
        }),
      },
      writable: true,
    });
    Object.defineProperty(window, "PushManager", {
      value: {},
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Given: The hook is rendered
  // When:  Dependencies are hoisted incorrectly
  // Then:  It should throw a ReferenceError (which we catch here to verify failure)
  it("TC-HOOK-01: should should not throw ReferenceError on mount", () => {
    expect(() => {
      renderHook(() => usePushNotifications());
    }).not.toThrow();
  });

  // Given: VAPID public key is missing
  // When:  subscribeToPush is called
  // Then:  It should return null and log an error
  it("TC-HOOK-02: should handle missing VAPID key gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = ""; // Simulate missing key

    // Re-render hook to pick up new env
    const { result } = renderHook(() => usePushNotifications());

    // Trigger subscription (need permission granted in mock)
    // Note: In our mock setup, permission is already granted.
    // But subscribeToPush won't run auto because we don't have isSupported fully working in test env?
    // Actually we need to call it manually or wait for effect.
    // For this unit test, let's call it direct if possible, returning 'result.current.subscribeToPush'

    // We need to await the result
    const sub = await result.current.subscribeToPush();

    expect(sub).toBeNull();
    // Verify error logging (we'll implement this in the code next)
    expect(consoleSpy).toHaveBeenCalledWith("VAPID public key not configured");

    consoleSpy.mockRestore();
  });

  // Given: Browser has existing subscription
  // When:  Hook initializes
  // Then:  It should sync subscription with backend
  it("TC-HOOK-03: should sync existing subscription on mount", async () => {
    // Mock existing subscription
    const mockSub = {
      endpoint: "https://existing.com",
      unsubscribe: vi.fn(),
      toJSON: () => ({}),
    };

    // We need to redefine the mock property for this specific test or update it
    // Since Object.defineProperty is on window/navigator, we can update the return value
    const getSubscriptionSpy = vi.fn().mockResolvedValue(mockSub);

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: getSubscriptionSpy,
            subscribe: vi.fn(),
          },
        }),
      },
      writable: true,
    });

    renderHook(() => usePushNotifications());

    // Wait for effects
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify sync was called
    // We need to import the mocked module to check expectation
    const { syncPushSubscription } = await import("@/lib/push-api");
    expect(syncPushSubscription).toHaveBeenCalledWith(mockSub);
  });

  // Given: Permission is granted (passed as override)
  // When:  subscribeToPush is called with the permission
  // Then:  It should create subscription and sync
  it("TC-HOOK-04: should subscribe when permission is passed directly", async () => {
    // Reset mocks
    vi.clearAllMocks();

    const mockSub = {
      endpoint: "https://new.com",
      unsubscribe: vi.fn(),
      toJSON: () => ({}),
    };
    const subscribeSpy = vi.fn().mockResolvedValue(mockSub);

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(null),
            subscribe: subscribeSpy,
          },
        }),
      },
      writable: true,
    });

    // Set valid VAPID key (valid base64 string)
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY =
      "BNPSNsXhfz1CMwPylzXlvTqv0XQlVLBR7xlNpLprGhVyjO30MTn0v0hwQ1x--Y0_nq42RG-FMqxGHKbsHxr0K20";

    const { result } = renderHook(() => usePushNotifications());

    // Directly call subscribeToPush with permission override
    const sub = await result.current.subscribeToPush("granted");

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verify push subscription was created
    expect(subscribeSpy).toHaveBeenCalled();
    expect(sub).not.toBeNull();
    // Verify sync was called
    const { syncPushSubscription } = await import("@/lib/push-api");
    expect(syncPushSubscription).toHaveBeenCalledWith(mockSub);
  });

  // Given: notificationsEnabled is true, but no active subscription exists (e.g. cleared manually)
  // When:  unsubscribe is called
  // Then:  It should still set notificationsEnabled to false (fixing stuck toggle)
  it("TC-HOOK-05: should disable notifications even if subscription is null", async () => {
    // Reset mocks - standard setup where getSubscription returns null
    vi.clearAllMocks();

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(null),
            subscribe: vi.fn(),
          },
        }),
      },
      writable: true,
    });

    const { result } = renderHook(() => usePushNotifications());

    // Act
    await result.current.unsubscribe();

    // Assert
    // It might return false because no actual subscription was removed,
    // BUT we expect setNotificationsEnabled to be called with false
    expect(mockSetNotificationsEnabled).toHaveBeenCalledWith(false);
  });
});
