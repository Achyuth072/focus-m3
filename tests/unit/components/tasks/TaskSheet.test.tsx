import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TaskSheet from "@/components/tasks/TaskSheet";
import type { Task } from "@/lib/types/task";
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/lib/hooks/useTaskMutations";
import { useInboxProject } from "@/lib/hooks/useTasks";
import { useProjects } from "@/lib/hooks/useProjects";

vi.mock("@/lib/hooks/useTaskMutations", () => ({
  useCreateTask: vi.fn(),
  useUpdateTask: vi.fn(),
  useDeleteTask: vi.fn(),
}));

vi.mock("@/lib/hooks/useTasks", () => ({
  useInboxProject: vi.fn(),
}));

vi.mock("@/lib/hooks/useProjects", () => ({
  useProjects: vi.fn(),
}));

const mockHapticTrigger = vi.fn();
vi.mock("@/lib/hooks/useHaptic", () => ({
  useHaptic: () => ({
    trigger: mockHapticTrigger,
    isPhone: false,
  }),
}));

describe("TaskSheet", () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCreateTask as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    });
    (useUpdateTask as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    });
    (useDeleteTask as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    });
    (useInboxProject as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { id: "inbox-id" },
    });
    (useProjects as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
    });
  });

  it('renders "New Task" header in creation mode', () => {
    render(<TaskSheet open={true} onClose={() => {}} />);
    expect(screen.getByText("New Task")).toBeInTheDocument();
  });

  it('renders "Edit Task" header in edit mode', () => {
    const mockTask = {
      id: "1",
      content: "Existing Task",
      priority: 4,
      is_completed: false,
    } as unknown as Task;
    render(<TaskSheet open={true} onClose={() => {}} initialTask={mockTask} />);
    expect(screen.getByText("Edit Task")).toBeInTheDocument();
  });

  it("validates: shows error for content > 500 chars", async () => {
    render(<TaskSheet open={true} onClose={() => {}} />);
    const input = screen.getByPlaceholderText("What needs to be done?");

    fireEvent.change(input, { target: { value: "a".repeat(501) } });

    // Wait for the async validation and UI update
    const error = await screen.findByText(/500/i);
    expect(error).toBeInTheDocument();
  });

  it("calls updateTask mutation when saving edits", async () => {
    const mockTask = {
      id: "1",
      content: "Original Task",
      priority: 4,
      is_completed: false,
    } as unknown as Task;

    render(<TaskSheet open={true} onClose={() => {}} initialTask={mockTask} />);

    // Verify we're in edit mode
    expect(screen.getByText("Edit Task")).toBeInTheDocument();

    // Change content
    const input = screen.getByPlaceholderText("What needs to be done?");
    fireEvent.change(input, { target: { value: "Updated Task Content" } });

    // Find the save button and wait for it to become enabled (validation is async)
    const saveButton = screen.getByRole("button", { name: /save/i });
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });

    // Submit form (Save)
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          content: "Updated Task Content",
        })
      );
      // Verify signature haptic for task update
      expect(mockHapticTrigger).toHaveBeenCalledWith([10, 50]);
    });
  });
});
