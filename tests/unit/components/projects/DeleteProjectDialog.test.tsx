import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import type { Project } from "@/lib/types/task";

const mockArchiveMutateAsync = vi.fn();
const mockArchiveMutate = vi.fn();
const mockMoveTasksMutateAsync = vi.fn();
const mockDeleteTasksMutateAsync = vi.fn();

vi.mock("@/lib/hooks/useProjectMutations", () => ({
  useArchiveProject: () => ({
    mutate: mockArchiveMutate,
    mutateAsync: mockArchiveMutateAsync,
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
  useMoveTasksToInbox: () => ({
    mutateAsync: mockMoveTasksMutateAsync,
    isPending: false,
  }),
  useDeleteProjectTasks: () => ({
    mutateAsync: mockDeleteTasksMutateAsync,
    isPending: false,
  }),
}));

const mockProject: Project = {
  id: "test-proj-1",
  user_id: "user-1",
  name: "Test Project",
  color: "#ff0000",
  view_style: "list",
  is_inbox: false,
  is_archived: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("DeleteProjectDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly when open with a project", () => {
    render(<DeleteProjectDialog open={true} onOpenChange={vi.fn()} project={mockProject} />);
    
    expect(screen.getByText("Delete Project")).toBeInTheDocument();
    expect(screen.getByText('What should happen to tasks in "Test Project"?')).toBeInTheDocument();
    
    expect(screen.getByRole("button", { name: "Move tasks to Inbox" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete all tasks" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep tasks archived" })).toBeInTheDocument();
  });

  it("does not render when project is null", () => {
    render(<DeleteProjectDialog open={true} onOpenChange={vi.fn()} project={null} />);
    expect(screen.queryByText("Delete Project")).not.toBeInTheDocument();
  });

  it("calls moveTasksToInbox and archive when 'Move tasks to Inbox' is clicked", async () => {
    mockMoveTasksMutateAsync.mockResolvedValueOnce(undefined);
    render(<DeleteProjectDialog open={true} onOpenChange={vi.fn()} project={mockProject} />);
    
    const moveBtn = screen.getByRole("button", { name: "Move tasks to Inbox" });
    
    await act(async () => {
      fireEvent.click(moveBtn);
    });
    
    expect(mockMoveTasksMutateAsync).toHaveBeenCalledWith("test-proj-1");
    await waitFor(() => {
      expect(mockArchiveMutate).toHaveBeenCalledWith("test-proj-1");
    });
  });

  it("calls deleteProjectTasks and archive when 'Delete all tasks' is clicked", async () => {
    mockDeleteTasksMutateAsync.mockResolvedValueOnce(undefined);
    render(<DeleteProjectDialog open={true} onOpenChange={vi.fn()} project={mockProject} />);
    
    const deleteBtn = screen.getByRole("button", { name: "Delete all tasks" });
    
    await act(async () => {
      fireEvent.click(deleteBtn);
    });
    
    expect(mockDeleteTasksMutateAsync).toHaveBeenCalledWith("test-proj-1");
    await waitFor(() => {
      expect(mockArchiveMutate).toHaveBeenCalledWith("test-proj-1");
    });
  });

  it("calls only archive when 'Keep tasks archived' is clicked", async () => {
    render(<DeleteProjectDialog open={true} onOpenChange={vi.fn()} project={mockProject} />);
    
    const keepBtn = screen.getByRole("button", { name: "Keep tasks archived" });
    
    await act(async () => {
      fireEvent.click(keepBtn);
    });
    
    expect(mockMoveTasksMutateAsync).not.toHaveBeenCalled();
    expect(mockDeleteTasksMutateAsync).not.toHaveBeenCalled();
    expect(mockArchiveMutate).toHaveBeenCalledWith("test-proj-1");
  });

  it("calls onOpenChange with false when cancel button is clicked", () => {
    const onOpenChange = vi.fn();
    render(<DeleteProjectDialog open={true} onOpenChange={onOpenChange} project={mockProject} />);
    
    const cancelBtn = screen.getByText("Cancel");
    fireEvent.click(cancelBtn);
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
