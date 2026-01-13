import { render, screen } from "@testing-library/react";
import { TimeGrid } from "@/components/calendar/TimeGrid";
import { MonthView } from "@/components/calendar/MonthView";
import { describe, it, expect } from "vitest";

describe("Regression Fixes", () => {
  const mockDate = new Date("2024-01-01T12:00:00");
  const mockEvents = [];

  it("TimeGrid: Header height should be compact (h-16) to avoid huge gap", () => {
    // Note: We test strictly for what we want to enact (h-16)
    render(
      <TimeGrid
        startDate={mockDate}
        daysToShow={1}
        events={mockEvents}
        data-testid="time-grid"
      />
    );
    const root = screen.getByTestId("time-grid");
    const headers = root.querySelectorAll(".sticky");
    const dayHeader = Array.from(headers).find((h) =>
      h.textContent?.includes("Mon")
    );

    expect(dayHeader).toBeTruthy();
    expect(dayHeader?.className).toContain("h-16");
    expect(dayHeader?.className).not.toContain("h-24");
  });

  it("MonthView: Grid lines should be visible (consistent border opacity)", () => {
    render(
      <MonthView
        currentDate={mockDate}
        events={mockEvents} // No events, checking empty state regression
        data-testid="month-view"
      />
    );

    // Find the cell for day '1'
    const dayOneText = screen.getAllByText("1")[0];
    const dayOne = dayOneText.closest("div.relative");

    expect(dayOne).toBeTruthy();
    // Expect visible borders (e.g. /40), not invisible (/10)
    expect(dayOne?.className).toContain("border-border/40");
    expect(dayOne?.className).not.toContain("border-border/10");
  });
});
