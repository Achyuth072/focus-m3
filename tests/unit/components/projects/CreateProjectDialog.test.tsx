import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";

// Mock hooks
const mockMutate = vi.fn();
vi.mock("@/lib/hooks/useProjectMutations", () => ({
  useCreateProject: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

vi.mock("@/lib/hooks/useHaptic", () => ({
  useHaptic: () => ({
    trigger: vi.fn(),
  }),
}));

describe("CreateProjectDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly when open", () => {
    render(<CreateProjectDialog open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText("Create Project")).toBeInTheDocument();
    expect(screen.getByLabelText("Project Name")).toBeInTheDocument();
  });

  it("shows validation error when name is empty and touched", async () => {
    render(<CreateProjectDialog open={true} onOpenChange={vi.fn()} />);
    const input = screen.getByLabelText("Project Name");

    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.change(input, { target: { value: "" } });

    await waitFor(() => {
      expect(screen.getByText("Project name is required")).toBeInTheDocument();
    });

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "project-name-error");
  });

  it("submits successfully with valid data", async () => {
    const onOpenChange = vi.fn();
    render(<CreateProjectDialog open={true} onOpenChange={onOpenChange} />);

    const input = screen.getByLabelText("Project Name");
    fireEvent.change(input, { target: { value: "New Project" } });

    const submitButton = screen.getByRole("button", { name: /create/i });

    // Wait for button to be enabled (isValid becoming true)
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockMutate).toHaveBeenCalledWith({
          name: "New Project",
          color: "#2196F3",
          view_style: "list",
        });
        expect(onOpenChange).toHaveBeenCalledWith(false);
      },
      { timeout: 3000 }
    );
  });

  it("changes color when a color button is clicked", async () => {
    render(<CreateProjectDialog open={true} onOpenChange={vi.fn()} />);

    const berryColor = screen.getByLabelText("Berry");
    fireEvent.click(berryColor);

    expect(berryColor).toHaveAttribute("aria-checked", "true");
  });
});
