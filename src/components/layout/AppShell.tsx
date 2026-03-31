"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";
import { CompletedTasksProvider } from "@/components/CompletedTasksProvider";
import {
  TaskActionsProvider,
  useTaskActions,
} from "@/components/TaskActionsProvider";
import {
  ProjectActionsProvider,
  useProjectActions,
} from "@/components/ProjectActionsProvider";
import { useRealtimeSync } from "@/lib/hooks/useRealtimeSync";
import { PiPProvider } from "@/components/providers/PiPProvider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import AddTaskFab from "@/components/tasks/AddTaskFab";
import AddHabitFab from "@/components/habits/AddHabitFab";
import AddEventFab from "@/components/calendar/AddEventFab";
import { HabitSheet } from "@/components/habits/HabitSheet";
import {
  HabitActionsProvider,
  useHabitActions,
} from "@/components/habits/HabitActionsProvider";
import { GlobalHotkeys } from "@/components/layout/GlobalHotkeys";
import { useMigrationStrategy } from "@/lib/hooks/useMigrationStrategy";
import { LoaderOverlay } from "@/components/ui/loader-overlay";

import { cn } from "@/lib/utils";
import { useUiStore } from "@/lib/store/uiStore";
import { useCalendarStore } from "@/lib/calendar/store";

// Global Overlays (Lazy Loaded)
const TaskSheet = dynamic(() => import("@/components/tasks/TaskSheet"), {
  ssr: false,
});
const CommandMenu = dynamic(
  () => import("@/components/command-menu").then((mod) => mod.CommandMenu),
  { ssr: false },
);
const OfflineIndicator = dynamic(
  () =>
    import("@/components/OfflineIndicator").then((mod) => mod.OfflineIndicator),
  { ssr: false },
);
const ShortcutsHelp = dynamic(
  () =>
    import("@/components/ui/ShortcutsHelp").then((mod) => mod.ShortcutsHelp),
  { ssr: false },
);
const CreateProjectDialog = dynamic(
  () =>
    import("@/components/projects/CreateProjectDialog").then(
      (mod) => mod.CreateProjectDialog,
    ),
  { ssr: false },
);
const FloatingTimer = dynamic(
  () => import("@/components/FloatingTimer").then((mod) => mod.FloatingTimer),
  { ssr: false },
);
const CreateEventDialog = dynamic(
  () =>
    import("@/components/calendar/CreateEventDialog").then(
      (mod) => mod.CreateEventDialog,
    ),
  { ssr: false },
);

const ProjectDialogs = dynamic(
  () =>
    import("@/components/projects/ProjectDialogs").then(
      (mod) => mod.ProjectDialogs,
    ),
  { ssr: false },
);
const ArchivedProjectsDialog = dynamic(
  () =>
    import("@/components/projects/ArchivedProjectsDialog").then(
      (mod) => mod.ArchivedProjectsDialog,
    ),
  { ssr: false },
);

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellContent({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isFocus = pathname === "/focus";
  const hideMobileNav = pathname === "/focus" || pathname === "/settings";
  const isTasksPage = pathname === "/";
  const isHabitsPage = pathname === "/habits";
  const isCalendarPage = pathname === "/calendar";
  const { isAddTaskOpen, openAddTask, closeAddTask } = useTaskActions();
  const { isHabitSheetOpen, editingHabit, openAddHabit, closeHabitSheet } =
    useHabitActions();
  const {
    isCreateEventOpen,
    openCreateEvent,
    closeCreateEvent,
    defaultDate,
    selectedEvent,
  } = useCalendarStore();

  const { isCreateProjectOpen, closeCreateProject } = useProjectActions();
  const { isShortcutsHelpOpen, setShortcutsHelpOpen, isArchivedProjectsOpen, setArchivedProjectsOpen } = useUiStore();

  const [commandOpen, setCommandOpen] = useState(false);

  // Global realtime sync - stays alive during navigation
  useRealtimeSync();


  // Reset scroll position on navigation to prevent layout shifts
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <CompletedTasksProvider>
      <SidebarProvider defaultOpen={true}>
        <GlobalHotkeys
          setCommandOpen={setCommandOpen}
          setHelpOpen={setShortcutsHelpOpen}
        />
        {/* Mobile Top Bar - hidden on Focus and Settings pages */}
        {!hideMobileNav && <MobileHeader />}

        {/* Desktop Sidebar - hidden only on Focus page */}
        {!isFocus && <AppSidebar />}

        {/* Main Content with proper inset */}
        <SidebarInset className="relative">

          <div
            ref={scrollContainerRef}
            className={cn(
              "flex-1 md:pt-0 md:pb-0",
              pathname === "/calendar" ||
                isFocus ||
                pathname === "/" ||
                pathname === "/habits"
                ? "overflow-hidden"
                : "overflow-y-auto overflow-x-hidden",
              !hideMobileNav && "pt-[calc(4rem+env(safe-area-inset-top,0px))]",
            )}
          >
            {children}
            {!hideMobileNav && pathname === "/" && (
              <div className="h-32 w-full flex-none" aria-hidden="true" />
            )}
            {!hideMobileNav && pathname !== "/" && pathname !== "/calendar" && (
              <div className="h-20 w-full flex-none" aria-hidden="true" />
            )}
          </div>
        </SidebarInset>

        {/* Mobile Bottom Nav - hidden on Focus and Settings pages */}
        {!hideMobileNav && <MobileNav />}

        {/* FABs - Rendered outside template animation to prevent shifts */}
        {isTasksPage && <AddTaskFab onClick={openAddTask} />}
        {isHabitsPage && <AddHabitFab onClick={openAddHabit} />}
        {isCalendarPage && <AddEventFab onClick={openCreateEvent} />}

        {/* Global Task Sheet */}
        <TaskSheet open={isAddTaskOpen} onClose={closeAddTask} />

        {/* Global Habit Sheet */}
        <HabitSheet
          open={isHabitSheetOpen}
          onClose={closeHabitSheet}
          initialHabit={editingHabit}
        />

        <CreateProjectDialog
          open={isCreateProjectOpen}
          onOpenChange={closeCreateProject}
        />
        <ProjectDialogs />

        {/* Global Command Menu */}
        <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
        <ShortcutsHelp
          open={isShortcutsHelpOpen}
          onOpenChange={setShortcutsHelpOpen}
        />

        <CreateEventDialog
          open={isCreateEventOpen}
          onOpenChange={(open) => {
            if (!open) closeCreateEvent();
          }}
          defaultDate={defaultDate}
          event={selectedEvent}
        />

        <ArchivedProjectsDialog
          open={isArchivedProjectsOpen}
          onOpenChange={setArchivedProjectsOpen}
        />

        {/* Floating Timer - shows when timer is active and not on focus page */}
        <FloatingTimer />

        {/* Global System States */}
        <OfflineIndicator />
      </SidebarProvider>
    </CompletedTasksProvider>
  );
}

export default function AppShell({ children }: AppShellProps) {
  const { user, loading } = useAuth();
  const { isMigrating } = useMigrationStrategy();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <ProjectActionsProvider>
      <TaskActionsProvider>
        <HabitActionsProvider>
          <PiPProvider>
            {loading || !user || isLoginPage ? (
              <>{children}</>
            ) : (
              <AppShellContent>{children}</AppShellContent>
            )}
          </PiPProvider>
        </HabitActionsProvider>
      </TaskActionsProvider>
      {isMigrating && <LoaderOverlay message="Migrating guest data..." />}
    </ProjectActionsProvider>
  );
}
