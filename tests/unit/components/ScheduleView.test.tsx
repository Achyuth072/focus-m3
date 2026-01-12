import { render, screen } from "@testing-library/react";
import { ScheduleView } from "@/components/calendar/ScheduleView";
import { describe, it, expect } from "vitest";

describe("ScheduleView Layout & Scrolling", () => {
  const mockDate = new Date("2024-01-01T12:00:00");
  const mockEvents = [
    {
      id: "1",
      title: "Test Event",
      start: new Date("2024-01-01T13:00:00"),
      end: new Date("2024-01-01T14:00:00"),
      top: 50,
      height: 10,
      color: "red",
    },
  ];

  it("TC-CAL-03: Header and Root should use robust scrolling layout", () => {
    render(
      <ScheduleView
        startDate={mockDate}
        events={mockEvents}
        daysToShow={3}
        data-testid="schedule-view"
      />
    );

    // 1. Verify Root Overflow
    const root = screen.getByTestId("schedule-view");
    // Should have overflow handling and isolation to prevent leak
    expect(root.className).toContain("overflow-auto");
    // Expect isolation relative to ensure z-index context (optional but good)

    // 2. Verify Sticky Header Z-Index
    // Find header for Jan 1 (format "d" gives "1")
    const dayHeader = screen.getByText("1").closest(".sticky");

    expect(dayHeader).toBeTruthy();
    expect(dayHeader?.className).toContain("sticky");
    expect(dayHeader?.className).toContain("top-0");

    // Check for High Z-Index to beat events (Zen Max Requirement)
    // Currently likely z-10, needs update to z-30
    expect(dayHeader?.className).toContain("z-30");

    // Check for background to ensure opacity
    expect(dayHeader?.className).toContain("bg-background");
  });
});
