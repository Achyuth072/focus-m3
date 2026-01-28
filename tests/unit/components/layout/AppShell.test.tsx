import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AppShell from "@/components/layout/AppShell";
import { usePathname } from "next/navigation";
import React from "react";

// Mock dependencies
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "test-user" },
    loading: false,
    isGuestMode: false,
  }),
}));

vi.mock("@/components/TaskActionsProvider", () => ({
  TaskActionsProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useTaskActions: () => ({
    isAddTaskOpen: false,
    openAddTask: vi.fn(),
    closeAddTask: vi.fn(),
  }),
}));

vi.mock("@/components/ProjectActionsProvider", () => ({
  ProjectActionsProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useProjectActions: () => ({
    isCreateProjectOpen: false,
    closeCreateProject: vi.fn(),
  }),
}));

vi.mock("@/components/TimerProvider", () => ({
  TimerProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/CompletedTasksProvider", () => ({
  CompletedTasksProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/lib/hooks/useRealtimeSync", () => ({
  useRealtimeSync: vi.fn(),
}));

vi.mock("@/lib/store/uiStore", () => ({
  useUiStore: () => ({
    isShortcutsHelpOpen: false,
    setShortcutsHelpOpen: vi.fn(),
  }),
}));

vi.mock("@/lib/hooks/useHabitMutations", () => ({
  useCreateHabit: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateHabit: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteHabit: () => ({ mutate: vi.fn(), isPending: false }),
}));

// Mock dynamic components to avoid loading overhead/errors
vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="mock-dynamic" />,
}));

vi.mock("@/components/layout/GlobalHotkeys", () => ({
  GlobalHotkeys: () => <div data-testid="global-hotkeys" />,
}));

vi.mock("@/components/layout/AppSidebar", () => ({
  AppSidebar: () => <div data-testid="app-sidebar" />,
}));

vi.mock("@/components/layout/MobileHeader", () => ({
  MobileHeader: () => <div data-testid="mobile-header" />,
}));

vi.mock("@/components/layout/MobileNav", () => ({
  MobileNav: () => <div data-testid="mobile-nav" />,
}));

vi.mock("@/components/tasks/AddTaskFab", () => ({
  default: () => <div data-testid="add-task-fab" />,
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-inset">{children}</div>
  ),
  useSidebar: () => ({
    toggleSidebar: vi.fn(),
    open: true,
    setOpen: vi.fn(),
  }),
}));

describe("AppShell Layout & Scroll Behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reset scroll position when navigating from Stats (scrollable) to Tasks (hidden overflow)", async () => {
    // 1. Start at /stats (overflow-y-auto)
    vi.mocked(usePathname).mockReturnValue("/stats");

    // We need to render the internal component structure.
    // Since AppShell default export wraps context, we can test it directly if we mock everything right,
    // or we might need to export the inner AppShellContent if we want easier access.
    // However, testing the default export is more integration-like.

    const { rerender } = render(
      <AppShell>
        <div style={{ height: "2000px" }}>Long Content</div>
      </AppShell>,
    );

    // Find the main content div which has the overflow class
    // In AppShell.tsx, it's the div inside SidebarInset
    const scrollContainer = screen
      .getByTestId("sidebar-inset")
      .querySelector("div.overflow-y-auto");
    expect(scrollContainer).toBeInTheDocument();

    // 2. Simulate scrolling down
    if (scrollContainer) {
      let scrollTop = 0;
      Object.defineProperty(scrollContainer, "scrollTop", {
        get: () => scrollTop,
        set: (val) => {
          scrollTop = val;
        },
        configurable: true,
      });

      fireEvent.scroll(scrollContainer, { target: { scrollTop: 500 } });
      scrollContainer.scrollTop = 500;
      expect(scrollContainer.scrollTop).toBe(500);
    }

    // 3. Navigate to / (Tasks) - which changes the class to overflow-hidden
    vi.mocked(usePathname).mockReturnValue("/");

    rerender(
      <AppShell>
        <div>Tasks Content</div>
      </AppShell>,
    );

    // 4. Verify the container class changed
    await waitFor(() => {
      const updatedContainer = screen
        .getByTestId("sidebar-inset")
        .querySelector("div.overflow-hidden");
      expect(updatedContainer).toBeInTheDocument();
    });

    // 5. Verify Scroll Position Reset
    const finalContainer = screen
      .getByTestId("sidebar-inset")
      .querySelector("div.overflow-hidden");
    await waitFor(() => {
      expect(finalContainer?.scrollTop).toBe(0);
    });
  });

  it("should apply overflow-hidden class for /habits path", () => {
    // Given: Path is set to /habits
    vi.mocked(usePathname).mockReturnValue("/habits");

    // When: Rendering AppShell
    render(
      <AppShell>
        <div>Habits Content</div>
      </AppShell>,
    );

    // Then: The container inside SidebarInset should have overflow-hidden class
    const container = screen
      .getByTestId("sidebar-inset")
      .querySelector("div.overflow-hidden");

    expect(container).toBeInTheDocument();
  });

  it("should apply overflow-y-auto class for /stats path (regression check)", () => {
    // Given: Path is set to /stats
    vi.mocked(usePathname).mockReturnValue("/stats");

    // When: Rendering AppShell
    render(
      <AppShell>
        <div>Stats Content</div>
      </AppShell>,
    );

    // Then: The container inside SidebarInset should have overflow-y-auto class
    const container = screen
      .getByTestId("sidebar-inset")
      .querySelector("div.overflow-y-auto");

    expect(container).toBeInTheDocument();
  });
});
