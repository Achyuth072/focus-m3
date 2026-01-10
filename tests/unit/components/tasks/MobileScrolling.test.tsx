import { render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { TaskMasonryGrid } from "@/components/tasks/TaskMasonryGrid";
import { TaskKanbanBoard } from "@/components/tasks/TaskKanbanBoard";
import { TaskListView } from "@/components/tasks/TaskListView";

// Mock DnD Kit Core
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: any) => (
    <div data-testid="dnd-context">{children}</div>
  ),
  closestCorners: vi.fn(),
  closestCenter: vi.fn(),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
  DragOverlay: ({ children }: any) => <div>{children}</div>,
  defaultDropAnimationSideEffects: vi.fn(() => ({})),
}));

// Mock DnD Kit Sortable
vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: vi.fn(),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

// Mock DnD Kit Utilities (used by SortableTaskItem)
vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => null),
    },
  },
}));

// Mock useHaptic hook
vi.mock("@/lib/hooks/useHaptic", () => ({
  useHaptic: () => ({ trigger: vi.fn() }),
}));

// Mock TaskItem component (use correct alias path)
vi.mock("@/components/tasks/TaskItem", () => ({
  default: () => <div data-testid="task-item" />,
}));

// Mock SortableTaskItem component (use correct alias path)
vi.mock("@/components/tasks/SortableTaskItem", () => ({
  default: () => <div data-testid="sortable-task-item" />,
}));

describe("Mobile Scrolling Padding", () => {
  const mockProcessedTasks = {
    active: [{ id: "1", content: "Test Task" } as any],
    evening: [],
    completed: [],
    groups: null,
  };

  it("TaskMasonryGrid should have bottom padding to prevent cutoff on mobile", () => {
    const { container } = render(
      <TaskMasonryGrid processedTasks={mockProcessedTasks} />
    );

    const gridContainer = container.querySelector("div.px-4");
    expect(gridContainer).not.toBeNull();
    expect(gridContainer?.className).toContain("pb-24");
    expect(gridContainer?.className).toContain("md:pb-8");
  });

  it("TaskKanbanBoard should have bottom padding to prevent cutoff on mobile", () => {
    const { container } = render(
      <TaskKanbanBoard processedTasks={mockProcessedTasks} />
    );

    // Find the board container which has pb-24 class
    const boardContainer = container.querySelector("[class*='pb-24']");
    expect(boardContainer).not.toBeNull();
    expect(boardContainer?.className).toContain("pb-24");
    expect(boardContainer?.className).toContain("md:pb-6");
  });

  it("TaskListView should have bottom padding to prevent cutoff on mobile", () => {
    const { container } = render(
      <TaskListView
        processedTasks={mockProcessedTasks}
        localTasks={mockProcessedTasks.active}
        sensors={[]}
        handleDragStart={vi.fn()}
        handleDragEnd={vi.fn()}
        handleTaskClick={vi.fn()}
        keyboardSelectedId={null}
      />
    );

    const listContainer = container.querySelector("[class*='pb-24']");
    expect(listContainer).not.toBeNull();
    expect(listContainer?.className).toContain("pb-24");
    expect(listContainer?.className).toContain("md:pb-8");
  });
});
