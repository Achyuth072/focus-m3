import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { useProfile } from "@/lib/hooks/useProfile";
import { useAuth } from "@/components/AuthProvider";
import { useHaptic } from "@/lib/hooks/useHaptic";
import React from "react";

// Mock hooks
vi.mock("@/lib/hooks/usePushNotifications");
vi.mock("@/lib/hooks/useProfile");
vi.mock("@/components/AuthProvider");
vi.mock("@/lib/hooks/useHaptic");

describe("NotificationSettings Component", () => {
  const mockUpdateSettings = { mutateAsync: vi.fn() };
  const mockUpdateProfile = { mutateAsync: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();

    (usePushNotifications as any).mockReturnValue({
      isSupported: true,
      permission: "granted", // Set to granted by default for most tests
      notificationsEnabled: true,
      isSyncing: false,
      requestPermission: vi.fn(),
      unsubscribe: vi.fn(),
    });

    (useProfile as any).mockReturnValue({
      profile: {
        timezone: "UTC",
        settings: {
          notifications: {
            morning_briefing: true,
            evening_plan: true,
            due_date_alerts: true,
            do_date_alerts: true,
            timer_alerts: true,
          },
        },
      },
      updateSettings: mockUpdateSettings,
      updateProfile: mockUpdateProfile,
    });

    (useAuth as any).mockReturnValue({ isGuestMode: false });
    (useHaptic as any).mockReturnValue({ trigger: vi.fn() });
  });

  it("TC-NS-01: should render all notification toggles and timezone picker", () => {
    render(<NotificationSettings />);

    expect(screen.getByText(/Push Notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm your timezone/i)).toBeInTheDocument();
    expect(screen.getByText("Morning Briefing")).toBeInTheDocument();
    expect(screen.getByText("Evening Plan")).toBeInTheDocument();
  });

  it("TC-NS-02: should call updateSettings when a toggle is changed", async () => {
    render(<NotificationSettings />);

    // Find Morning Briefing toggle by its aria-label
    const briefingToggle = screen.getByLabelText(/Morning Briefing/i);
    fireEvent.click(briefingToggle);

    expect(mockUpdateSettings.mutateAsync).toHaveBeenCalled();
  });

  it("TC-NS-04: should show guest mode warning when permission is granted", () => {
    (useAuth as any).mockReturnValue({ isGuestMode: true });
    render(<NotificationSettings />);

    expect(
      screen.getByText(/Server-side alerts require a synced account/i)
    ).toBeInTheDocument();
  });

  it("TC-NS-05: should show not supported message when browser doesn't support push", () => {
    (usePushNotifications as any).mockReturnValue({
      isSupported: false,
      permission: "default",
    });
    render(<NotificationSettings />);

    expect(
      screen.getByText(/Notifications Not Supported/i)
    ).toBeInTheDocument();
  });
});
