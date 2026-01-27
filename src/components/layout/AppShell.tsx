"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
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
import { HabitSheet } from "@/components/habits/HabitSheet";
import {
  HabitActionsProvider,
  useHabitActions,
} from "@/components/habits/HabitActionsProvider";
import { GlobalHotkeys } from "@/components/layout/GlobalHotkeys";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useUiStore } from "@/lib/store/uiStore";

// Global Overlays (Lazy Loaded)
const TaskSheet = dynamic(() => import("@/components/tasks/TaskSheet"), {
  ssr: false,
});
const CommandMenu = dynamic(
  () => import("@/components/command-menu").then((mod) => mod.CommandMenu),
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

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellContent({ children }: AppShellProps) {
  const pathname = usePathname();
  const isFocus = pathname === "/focus";
  const hideMobileNav = pathname === "/focus" || pathname === "/settings";
  const isTasksPage = pathname === "/";
  const isHabitsPage = pathname === "/habits";
  const { isAddTaskOpen, openAddTask, closeAddTask } = useTaskActions();
  const { isHabitSheetOpen, editingHabit, openAddHabit, closeHabitSheet } =
    useHabitActions();

  const { isCreateProjectOpen, closeCreateProject } = useProjectActions();
  const { isShortcutsHelpOpen, setShortcutsHelpOpen } = useUiStore();

  const [commandOpen, setCommandOpen] = useState(false);

  // Global realtime sync - stays alive during navigation
  useRealtimeSync();
  const { isGuestMode } = useAuth();

  // Banner dismiss state (session-based)
  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem("guest_banner_dismissed") !== "true";
  });

  const dismissBanner = () => {
    setShowBanner(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("guest_banner_dismissed", "true");
    }
  };

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
          <AnimatePresence>
            {isGuestMode && showBanner && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  type: "spring",
                  mass: 1,
                  stiffness: 280,
                  damping: 60,
                }}
                className={cn(
                  "fixed z-30 pointer-events-none flex justify-center",
                  "left-0 right-0 px-4 top-18", // Mobile: Floating comfortably below header
                  "md:left-[var(--sidebar-width)] md:px-0 md:top-4 md:right-6 md:justify-end", // Desktop: Floating top-right banner
                )}
              >
                <div className="pointer-events-auto flex items-center justify-between w-full max-w-[500px] md:w-[350px] bg-sidebar border border-border text-foreground text-[13px] font-medium py-2.5 px-4 rounded-xl shadow-2xl shadow-black/5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-brand shadow-[0_0_8px_hsl(var(--brand)/0.3)]" />
                    <div className="flex flex-col leading-tight">
                      <span className="font-semibold tracking-tight">
                        Guest Mode
                      </span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        Data stored locally on this device
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={dismissBanner}
                    className="p-1.5 hover:bg-accent rounded-lg transition-seijaku-fast flex-shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                    aria-label="Dismiss banner"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            ref={scrollContainerRef}
            className={cn(
              "flex-1 md:pt-0 md:pb-0",
              pathname === "/calendar" || isFocus || pathname === "/"
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

        {/* Global Command Menu */}
        <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
        <ShortcutsHelp
          open={isShortcutsHelpOpen}
          onOpenChange={setShortcutsHelpOpen}
        />

        {/* Floating Timer - shows when timer is active and not on focus page */}
        <FloatingTimer />
      </SidebarProvider>
    </CompletedTasksProvider>
  );
}

export default function AppShell({ children }: AppShellProps) {
  const { user, loading } = useAuth();
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
    </ProjectActionsProvider>
  );
}
