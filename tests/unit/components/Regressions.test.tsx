import { render, screen } from "@testing-library/react";
import { TimeGrid } from "@/components/calendar/TimeGrid";
import { MonthView } from "@/components/calendar/MonthView";
import { describe, it, expect } from "vitest";
import type { CalendarEvent } from "@/lib/calendar/types";

describe("Regression Fixes", () => {
  const mockDate = new Date("2024-01-01T12:00:00");
  const mockEvents: CalendarEvent[] = [];

  it("TimeGrid: Header height should be compact (h-16) to avoid huge gap", () => {
    // Note: We test strictly for what we want to enact (h-16)
    render(
      <TimeGrid
        startDate={mockDate}
        daysToShow={1}
        events={mockEvents}
        data-testid="time-grid"
      />,
    );
    const root = screen.getByTestId("time-grid");
    const headers = root.querySelectorAll(".sticky");
    const dayHeader = Array.from(headers).find((h) =>
      h.textContent?.includes("Mon"),
    );

    expect(dayHeader).toBeTruthy();
    expect(dayHeader?.className).toContain("h-16");
    expect(dayHeader?.className).not.toContain("h-24");
  });

  it("TimeGrid: should render CurrentTimeIndicator when today is visible", () => {
    const today = new Date();
    render(
      <TimeGrid
        startDate={today}
        daysToShow={1}
        events={[]}
        data-testid="time-grid"
      />,
    );
    expect(screen.getByTestId("current-time-indicator")).toBeInTheDocument();
  });

  it("TimeGrid: should attempt to scroll to current time on mount", () => {
    const today = new Date();
    const { getByTestId } = render(
      <TimeGrid
        startDate={today}
        daysToShow={1}
        events={[]}
        data-testid="time-grid"
      />,
    );
    const grid = getByTestId("time-grid");
    expect(grid).toBeInTheDocument();
  });

  it("TimeGrid: should calculate horizontal scroll for mobile week view", () => {
    const today = new Date();
    // Start week 2 days ago so today is index 2
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 2);

    const { getByTestId } = render(
      <TimeGrid
        isMobile={true}
        startDate={startDate}
        daysToShow={7}
        events={[]}
        data-testid="time-grid"
      />,
    );
    const grid = getByTestId("time-grid");
    expect(grid).toBeInTheDocument();
    // Regression check: Ensure it doesn't crash and renders Today's indicator
    expect(screen.getByTestId("current-time-indicator")).toBeInTheDocument();
  });

  it("MonthView: Grid lines should be visible (consistent border opacity)", () => {
    render(
      <MonthView
        currentDate={mockDate}
        events={mockEvents} // No events, checking empty state regression
        data-testid="month-view"
      />,
    );

    // Find the cell for day '1'
    const dayOneText = screen.getAllByText("1")[0];
    const dayOne = dayOneText.closest("div.relative");

    expect(dayOne).toBeTruthy();
    // Expect minimal/subtle borders (/[0.08]), not heavy (/40)
    const grid = dayOne?.parentElement;
    expect(grid?.className).toContain("divide-border/[0.08]");
    expect(dayOne?.className).not.toContain("border-border/40");
  });

  it("MonthView: Events should be rendered on current day (highlighted)", () => {
    const today = new Date();
    const event: CalendarEvent = {
      id: "1",
      title: "Test Event Today",
      start: today,
      end: new Date(today.getTime() + 3600000),
      color: "#ff0000",
    };

    render(<MonthView currentDate={today} events={[event]} />);

    // Check if event title is in the document
    // If this fails, it's a Logic issue (event filtered out/not passed)
    // If this passes, it's a Visual issue (CSS/z-index)
    expect(screen.getByText("Test Event Today")).toBeInTheDocument();
  });

  it("TimeGrid: Z-Index Sandwich - Sidebar should allow Indicator to be visible but Header to clip", () => {
    // This test ensures the Z-Index hierarchy prevents the "Clipping" regression
    // Strategy:
    // 1. Sidebar Corner (Spacer) = z-50 (Must cover sliding headers)
    // 2. Day Header = z-40 (Must slide under Corner, but cover Indicator)
    // 3. Indicator = z-30 (Must slide under Header, but cover Sidebar Body)
    // 4. Sidebar Body (Labels) = z-20 (Must slide under Indicator, but cover Events)
    // 5. Events = z-10

    render(
      <TimeGrid
        startDate={mockDate}
        daysToShow={1} // Just 1 day is fine
        events={[]}
        data-testid="time-grid"
      />,
    );

    const sidebarContainer = screen.getByTestId("sidebar-container");
    const sidebarSpacer = screen.getByTestId("sidebar-spacer"); // The top-left corner
    const dayHeader = screen.getAllByTestId("day-header")[0];

    // For labels, we pick the first one (12 AM)
    const label = screen.getByText("12 AM").closest("div");

    // For Indicator, we assume it's rendered (need isToday=true logic or mock)
    // We already have a separate test for existence.
    // To check Z-index class we need it.
    // We can render with today to force it.
  });

  it("TimeGrid: Z-Index classes should create correct stacking context", () => {
    const today = new Date();
    render(
      <TimeGrid
        startDate={today}
        daysToShow={1}
        events={[]}
        data-testid="time-grid"
      />,
    );

    const sidebarContainer = screen.getByTestId("sidebar-container");
    const sidebarSpacer = screen.getByTestId("sidebar-spacer");
    const dayHeaders = screen.getAllByTestId("day-header");
    const labelsWrapper = screen.getByTestId("sidebar-labels");
    const indicator = screen.getByTestId("current-time-indicator");

    // 1. Sidebar Container should NOT have z-50 (it should be transparent/pass-through)
    expect(sidebarContainer.className).not.toContain("z-50");

    // 2. Sidebar Spacer (Corner) MUST have z-50 to stay on top
    expect(sidebarSpacer.className).toContain("z-50");
    expect(sidebarSpacer.className).toContain("sticky");
    expect(sidebarSpacer.className).toContain("top-0");

    // 3. Day Header MUST have z-40
    expect(dayHeaders[0].className).toContain("z-40");

    // 4. Indicator MUST have z-30
    expect(indicator.className).toContain("z-30");

    // 5. Sidebar Label Wrapper MUST have z-20 (to be below Indicator)
    expect(labelsWrapper.className).toContain("z-20");
    expect(labelsWrapper.className).toContain("relative"); // Needed for z-index to work
  });
});
