import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SplitViewLayout } from "@/components/tasks/SplitViewLayout";
import type { Task } from "@/lib/types/task";

// Mock dependencies using absolute paths
vi.mock("@/components/tasks/TaskList", () => ({
  default: ({ onTaskSelect }: { onTaskSelect: (task: Task) => void }) => (
    <div data-testid="task-list">
      <button
        onClick={() =>
          onTaskSelect({ id: "task-1", content: "Selected Task" } as Task)
        }
      >
        Select Task 1
      </button>
    </div>
  ),
}));

vi.mock("@/components/tasks/TaskDetailPanel", () => ({
  TaskDetailPanel: ({
    task,
    onClose,
  }: {
    task: Task | null;
    onClose: () => void;
  }) => (
    <div data-testid="task-detail-panel">
      {task ? (
        <>
          <span>{task.content}</span>
          <button onClick={onClose}>Close Detail</button>
        </>
      ) : (
        <span>Empty State</span>
      )}
    </div>
  ),
}));

const mockHapticTrigger = vi.fn();
vi.mock("@/lib/hooks/useHaptic", () => ({
  useHaptic: () => ({
    trigger: mockHapticTrigger,
  }),
}));

// Mock resizable panels to avoid layout issues in JSDOM
vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="resizable-group">{children}</div>
  ),
  ResizablePanel: ({
    children,
    collapsible,
    collapsedSize,
  }: {
    children: React.ReactNode;
    collapsible?: boolean;
    collapsedSize?: number;
  }) => (
    <div
      data-testid="resizable-panel"
      data-collapsible={collapsible}
      data-collapsed-size={collapsedSize}
    >
      {children}
    </div>
  ),
  ResizableHandle: () => <div data-testid="resizable-handle" />,
}));

describe("SplitViewLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("SV-N-01: Renders with no selected task by default", () => {
    // Given: Default props
    // When: Rendering the layout
    render(<SplitViewLayout />);

    // Then: Detail panel should show empty state
    expect(screen.getByText("Empty State")).toBeInTheDocument();
  });

  it("SV-N-02: Updates detail panel when a task is selected", () => {
    // Given: Layout is rendered
    render(<SplitViewLayout />);

    // When: Selecting a task from the list
    const selectBtn = screen.getByText("Select Task 1");
    fireEvent.click(selectBtn);

    // Then: Detail panel should show the selected task
    expect(screen.getByText("Selected Task")).toBeInTheDocument();
    expect(mockHapticTrigger).toHaveBeenCalledWith(15);
  });

  it("SV-N-03: Returns to empty state when detail panel is closed", () => {
    // Given: A task is selected
    render(<SplitViewLayout />);
    fireEvent.click(screen.getByText("Select Task 1"));
    expect(screen.queryByText("Empty State")).not.toBeInTheDocument();

    // When: Clicking the close button in detail panel
    const closeBtn = screen.getByText("Close Detail");
    fireEvent.click(closeBtn);

    // Then: Detail panel should show empty state again
    expect(screen.getByText("Empty State")).toBeInTheDocument();
    expect(mockHapticTrigger).toHaveBeenCalledWith(10);
  });

  it("SV-03: Detail panel is collapsible", () => {
    // When: Rendering the layout
    render(<SplitViewLayout />);

    // Then: The second panel should be collapsible
    const panels = screen.getAllByTestId("resizable-panel");
    const detailPanel = panels[1];
    expect(detailPanel).toHaveAttribute("data-collapsible", "true");
  });

  it("SV-04: Detail panel has collapsedSize of 0", () => {
    // When: Rendering the layout
    render(<SplitViewLayout />);

    // Then: Collapsed size should be 0
    const panels = screen.getAllByTestId("resizable-panel");
    const detailPanel = panels[1];
    expect(detailPanel).toHaveAttribute("data-collapsed-size", "0");
  });
});
