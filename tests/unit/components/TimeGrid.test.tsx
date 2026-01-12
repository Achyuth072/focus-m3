import { render, screen } from "@testing-library/react";
import { TimeGrid } from "@/components/calendar/TimeGrid";
import { describe, it, expect } from "vitest";

describe("TimeGrid Layout & Scrolling", () => {
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

  it("TC-CAL-01: Header and Root should use robust scrolling layout", () => {
    render(
      <TimeGrid
        startDate={mockDate}
        daysToShow={1} // Day view
        events={mockEvents}
        data-testid="time-grid"
      />
    );

    // 1. Verify Root Overflow
    const root = screen.getByTestId("time-grid");
    expect(root.className).toContain("overflow-y-auto");
    expect(root.className).toContain("isolate"); // New stacking context

    // 2. Verify Right-column Sticky Header
    // Finding it via class navigation is safer than text since date format varies
    const headers = root.querySelectorAll(".sticky");
    // Should have 2 sticky headers: 1 for time column spacer, 1 for day column
    expect(headers.length).toBeGreaterThanOrEqual(1);

    const dayHeader = Array.from(headers).find((h) =>
      h.textContent?.includes("Mon")
    );
    expect(dayHeader).toBeTruthy();
    expect(dayHeader?.className).toContain("z-30"); // Upgraded Z-Index
    expect(dayHeader?.className).toContain("bg-background");
    expect(dayHeader?.className).toContain("top-0");

    // 3. Verify Left-column Sticky Spacer (Bonus fix)
    const timeSpacer = Array.from(headers).find((h) => !h.textContent); // Empty div
    expect(timeSpacer).toBeTruthy();
    expect(timeSpacer?.className).toContain("z-30");
  });

  it("TC-CAL-02: Root container should handle scrolling", () => {
    render(
      <TimeGrid
        startDate={mockDate}
        daysToShow={1}
        events={mockEvents}
        data-testid="time-grid"
      />
    );
    const root = screen.getByTestId("time-grid");
    expect(root.className).toContain("overflow-y-auto");
  });
});
