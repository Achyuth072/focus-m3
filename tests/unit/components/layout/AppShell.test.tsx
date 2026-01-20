import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AppShell from "@/components/layout/AppShell";
import { usePathname } from "next/navigation";

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
  TaskActionsProvider: ({ children }: any) => <div>{children}</div>,
  useTaskActions: () => ({
    isAddTaskOpen: false,
    openAddTask: vi.fn(),
    closeAddTask: vi.fn(),
  }),
}));

vi.mock("@/components/ProjectActionsProvider", () => ({
  ProjectActionsProvider: ({ children }: any) => <div>{children}</div>,
  useProjectActions: () => ({
    isCreateProjectOpen: false,
    closeCreateProject: vi.fn(),
  }),
}));

vi.mock("@/components/TimerProvider", () => ({
  TimerProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/CompletedTasksProvider", () => ({
  CompletedTasksProvider: ({ children }: any) => <div>{children}</div>,
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
  SidebarProvider: ({ children }: any) => <div>{children}</div>,
  SidebarInset: ({ children }: any) => (
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
    (usePathname as any).mockReturnValue("/stats");

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
    (usePathname as any).mockReturnValue("/");

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
});
