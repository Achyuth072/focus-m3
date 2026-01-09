import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FocusSettingsDialog } from "@/components/FocusSettingsDialog";

const mockUpdateSettings = vi.fn();
vi.mock("@/components/TimerProvider", () => ({
  useTimer: () => ({
    settings: {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      autoStartBreak: false,
      autoStartFocus: false,
    },
    updateSettings: mockUpdateSettings,
  }),
  TimerProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock("@/lib/hooks/useHaptic", () => ({
  useHaptic: () => ({
    trigger: vi.fn(),
    isPhone: false,
  }),
}));

vi.mock("@/components/ui/slider", () => ({
  Slider: ({
    value,
    onValueChange,
    min,
    max,
  }: {
    value: number[];
    onValueChange: (v: number[]) => void;
    min: number;
    max: number;
  }) => (
    <input
      type="range"
      min={min}
      max={max}
      value={value[0]}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      aria-label="Slider"
      title="Slider"
    />
  ),
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
    id,
  }: {
    checked: boolean;
    onCheckedChange: (c: boolean) => void;
    id: string;
  }) => (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      aria-label="Switch"
      title="Switch"
    />
  ),
}));

vi.mock("@/lib/hooks/useMediaQuery", () => ({
  useMediaQuery: vi.fn(() => true), // Default to desktop
}));

describe("FocusSettingsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders settings fields when open", () => {
    render(<FocusSettingsDialog />);
    fireEvent.click(screen.getByText("Adjust Settings"));

    expect(screen.getByLabelText("Focus Duration")).toBeInTheDocument();
    expect(screen.getByLabelText("Short Break")).toBeInTheDocument();
  });

  it("shows error for invalid duration", async () => {
    render(<FocusSettingsDialog />);
    fireEvent.click(screen.getByText("Adjust Settings"));

    const input = screen.getByLabelText("Focus Duration");
    fireEvent.change(input, { target: { value: "0" } });

    await waitFor(() => {
      expect(
        screen.getByText("Focus duration must be at least 1 minute")
      ).toBeInTheDocument();
    });

    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("submits updated settings correctly", async () => {
    render(<FocusSettingsDialog />);
    fireEvent.click(screen.getByText("Adjust Settings"));

    const input = screen.getByLabelText("Focus Duration");
    fireEvent.change(input, { target: { value: "30" } });

    const saveButton = screen.getByText("Save Changes");

    // Wait for the form to be valid and button enabled
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          focusDuration: 30,
        })
      );
    });
  });
});
