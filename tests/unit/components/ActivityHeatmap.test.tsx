import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ActivityHeatmap } from "@/components/stats/ActivityHeatmap";
import { useHeatmapData } from "@/lib/hooks/useHeatmapData";

// Correct way to mock with variables in Vitest
const { mockPaint, mockDestroy } = vi.hoisted(() => ({
  mockPaint: vi.fn(),
  mockDestroy: vi.fn(),
}));

// Vitest mock factory
vi.mock("cal-heatmap", () => {
  return {
    default: class MockCal {
      paint = mockPaint;
      destroy = mockDestroy;
    },
  };
});

// Mock plugins
vi.mock("cal-heatmap/plugins/Tooltip", () => ({ default: class {} }));
vi.mock("cal-heatmap/plugins/Legend", () => ({ default: class {} }));

// Mock the hook
vi.mock("@/lib/hooks/useHeatmapData", () => ({
  useHeatmapData: vi.fn(),
}));

describe("ActivityHeatmap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render skeleton when loading", () => {
    vi.mocked(useHeatmapData).mockReturnValue({
      data: [],
      isLoading: true,
      maxValue: { combined: 0, focus: 0, tasks: 0 },
      activeDays: 0,
    });
    render(<ActivityHeatmap />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should initialize cal-heatmap on mount", () => {
    vi.mocked(useHeatmapData).mockReturnValue({
      data: [{ date: "2026-01-01", combined: 5, focus: 4, tasks: 2 }],
      isLoading: false,
      maxValue: { combined: 10, focus: 8, tasks: 4 },
      activeDays: 1,
    });
    render(<ActivityHeatmap />);
    expect(mockPaint).toHaveBeenCalled();
    const paintArgs = mockPaint.mock.calls[0][0];
    expect(paintArgs.data.y).toBe("combined");
  });

  it("should destroy cal-heatmap on unmount", () => {
    vi.mocked(useHeatmapData).mockReturnValue({
      data: [],
      isLoading: false,
      maxValue: { combined: 1, focus: 1, tasks: 1 },
      activeDays: 0,
    });
    const { unmount } = render(<ActivityHeatmap />);
    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("should render metric toggle tabs", () => {
    // Given: Component is rendered with data
    vi.mocked(useHeatmapData).mockReturnValue({
      data: [{ date: "2026-01-01", combined: 5, focus: 4, tasks: 2 }],
      isLoading: false,
      maxValue: { combined: 10, focus: 8, tasks: 4 },
      activeDays: 1,
    });
    render(<ActivityHeatmap />);

    // Then: All three metric tabs should be present
    expect(screen.getByRole("tab", { name: /combined/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /focus/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /tasks/i })).toBeInTheDocument();
  });
});
