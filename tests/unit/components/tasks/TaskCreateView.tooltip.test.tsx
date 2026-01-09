import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TaskCreateView } from "@/components/tasks/TaskCreateView";

// Mock necessary hooks and components
vi.mock("@/lib/hooks/useHaptic", () => ({
  useHaptic: () => ({ trigger: vi.fn() }),
}));

vi.mock("@/components/ui/responsive-dialog", () => ({
  ResponsiveDialog: ({ children }: any) => <div>{children}</div>,
  ResponsiveDialogHeader: ({ children }: any) => <div>{children}</div>,
  ResponsiveDialogTitle: ({ children }: any) => <h1>{children}</h1>,
  ResponsiveDialogContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock other sub-components to keep test focused
vi.mock("@/components/tasks/SubtaskList", () => ({ default: () => null }));
vi.mock("@/components/tasks/shared/TaskDatePicker", () => ({
  TaskDatePicker: () => null,
}));
vi.mock("@/components/tasks/shared/TaskPrioritySelect", () => ({
  TaskPrioritySelect: () => null,
}));
vi.mock("@/components/tasks/TaskSheet/RecurrencePicker", () => ({
  default: () => null,
}));

describe("TaskCreateView - Mobile Tooltips", () => {
  const defaultProps: any = {
    content: "",
    setContent: vi.fn(),
    dueDate: undefined,
    setDueDate: vi.fn(),
    doDate: undefined,
    setDoDate: vi.fn(),
    isEvening: false,
    setIsEvening: vi.fn(),
    priority: 4,
    setPriority: vi.fn(),
    recurrence: null,
    setRecurrence: vi.fn(),
    selectedProjectId: null,
    setSelectedProjectId: vi.fn(),
    datePickerOpen: false,
    setDatePickerOpen: vi.fn(),
    doDatePickerOpen: false,
    setDoDatePickerOpen: vi.fn(),
    showSubtasks: false,
    setShowSubtasks: vi.fn(),
    draftSubtasks: [],
    setDraftSubtasks: vi.fn(),
    inboxProjectId: "inbox-id",
    projects: [],
    isMobile: true,
    hasContent: true,
    isPending: false,
    onSubmit: vi.fn(),
    onKeyDown: vi.fn(),
  };

  it("should NOT have native title attributes when isMobile is true", () => {
    render(<TaskCreateView {...defaultProps} isMobile={true} />);

    const eveningBtn = screen.getByRole("button", { name: /evening/i });
    const subtasksBtn = screen.getByRole("button", {
      name: /toggle subtasks/i,
    });
    const submitBtn = screen.getByRole("button", { name: /create task/i });

    expect(eveningBtn).not.toHaveAttribute("title");
    expect(subtasksBtn).not.toHaveAttribute("title");
    expect(submitBtn).not.toHaveAttribute("title");
  });
});
