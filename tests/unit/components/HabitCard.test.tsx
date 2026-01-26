import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { HabitCard } from "@/components/habits/HabitCard";
import type { HabitWithEntries } from "@/lib/hooks/useHabits";
import * as useIsMobileModule from "@/lib/hooks/useIsMobile";
import * as useHabitMutationsModule from "@/lib/hooks/useHabitMutations";

vi.mock("@/lib/hooks/useIsMobile");
vi.mock("@/lib/hooks/useHabitMutations");

describe("HabitCard Scroll Initialization", () => {
  let mockHabit: HabitWithEntries;

  beforeEach(() => {
    vi.mocked(useIsMobileModule.useIsMobile).mockReturnValue(false);
    vi.mocked(useHabitMutationsModule.useMarkHabitComplete).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 365);

    mockHabit = {
      id: "habit-test",
      user_id: "user-test",
      name: "Test Habit",
      description: "Test description",
      color: "#3b82f6",
      icon: "Droplets",
      created_at: today.toISOString(),
      updated_at: today.toISOString(),
      archived_at: null,
      start_date: startDate.toISOString().split("T")[0],
      entries: [],
    };
  });

  it("should use custom-scrollbar for desktop affordance", async () => {
    // Given: A habit card
    const { container } = render(<HabitCard habit={mockHabit} />);

    // Then: Scroll container should have correct classes and no negative margins
    const scrollContainer = container.querySelector(
      ".overflow-x-auto",
    ) as HTMLElement;
    expect(scrollContainer).toBeTruthy();
    expect(scrollContainer.className).toContain("custom-scrollbar");
    expect(scrollContainer.className).not.toContain("scrollbar-none");
    expect(scrollContainer.className).not.toContain("-mx-2");
  });
});
