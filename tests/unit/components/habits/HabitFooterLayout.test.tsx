import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HabitEditView } from "@/components/habits/HabitEditView";
import { HabitCreateView } from "@/components/habits/HabitCreateView";
import type { Habit } from "@/lib/types/habit";

// Mock haptics
vi.mock("@/lib/hooks/useHaptic", () => ({
  useHaptic: () => ({
    trigger: vi.fn(),
  }),
}));

// Mock the components used in the views
vi.mock("@/components/ui/responsive-dialog", () => ({
  ResponsiveDialogHeader: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  ResponsiveDialogTitle: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock("@/components/habits/shared/HabitColorPicker", () => ({
  HabitColorPicker: () => <div data-testid="color-picker" />,
}));

vi.mock("@/components/habits/shared/HabitIconPicker", () => ({
  HabitIconPicker: () => <div data-testid="icon-picker" />,
}));

vi.mock("@/components/tasks/shared/TaskDatePicker", () => ({
  TaskDatePicker: () => <div data-testid="date-picker" />,
}));

describe("Habit Views Footer Layout", () => {
  const mockHabit: Habit = {
    id: "1",
    name: "Test Habit",
    color: "#ff0000",
    icon: "Flame",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const commonProps = {
    name: "Test",
    setName: vi.fn(),
    description: "",
    setDescription: vi.fn(),
    color: "#ff0000",
    setColor: vi.fn(),
    icon: "Flame",
    setIcon: vi.fn(),
    startDate: undefined,
    setStartDate: vi.fn(),
    datePickerOpen: false,
    setDatePickerOpen: vi.fn(),
    isMobile: false,
    hasContent: true,
    isPending: false,
    onSubmit: vi.fn(),
    onKeyDown: vi.fn(),
  };

  it("HabitEditView footer should not contain color picker", () => {
    render(
      <HabitEditView
        {...commonProps}
        initialHabit={mockHabit}
        onDelete={vi.fn()}
      />,
    );

    const saveButton = screen.getByTitle(/save/i);
    const footer = saveButton.closest("div")!;
    const scrollContainer = footer.querySelector(".overflow-x-auto");

    const colorPicker = screen.getByTestId("color-picker");
    expect(scrollContainer?.contains(colorPicker)).toBe(false);
  });

  it("HabitCreateView footer should not contain color picker", () => {
    render(<HabitCreateView {...commonProps} />);

    // The submit button is Send icon in a button
    const footer = screen.getByLabelText(/start habit/i).closest("div")!;
    const scrollContainer = footer.querySelector(".overflow-x-auto");

    const colorPicker = screen.getByTestId("color-picker");
    expect(scrollContainer?.contains(colorPicker)).toBe(false);
  });

  it("Color picker should be in the view (structural verification)", () => {
    render(<HabitCreateView {...commonProps} />);

    const colorPicker = screen.getByTestId("color-picker");
    expect(colorPicker).toBeDefined();

    // Check it's not in the footer grid
    const footer = screen.getByLabelText(/start habit/i).closest("div")!;
    expect(footer.contains(colorPicker)).toBe(false);
  });
});
