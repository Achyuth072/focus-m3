import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TaskListView } from "@/components/tasks/TaskListView";

// Mock necessary hooks and components
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  useSensor: vi.fn(),
  useSensors: vi.fn(),
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  closestCenter: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: vi.fn(),
}));

vi.mock("./TaskItem", () => ({ default: () => null }));
vi.mock("./SortableTaskItem", () => ({ default: () => null }));

describe("TaskListView - Scrolling", () => {
  const mockProcessedTasks: any = {
    active: [],
    evening: [],
    completed: [],
  };

  it("should have bottom padding to prevent scrolling cutoff on mobile", () => {
    const { container } = render(
      <TaskListView
        processedTasks={mockProcessedTasks}
        localTasks={[]}
        sensors={[]}
        handleDragStart={vi.fn()}
        handleDragEnd={vi.fn()}
        handleTaskClick={vi.fn()}
        keyboardSelectedId={null}
      />
    );

    const listContainer = container.querySelector(".px-4.md\\:px-6.space-y-4");

    // This should FAIL until pb-24 or similar is added
    expect(listContainer?.className).toContain("pb-24");
  });
});
