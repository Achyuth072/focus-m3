"use client";

import { useState } from "react";
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
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import AddTaskFab from "@/components/tasks/AddTaskFab";
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
  { ssr: false }
);
const ShortcutsHelp = dynamic(
  () =>
    import("@/components/ui/ShortcutsHelp").then((mod) => mod.ShortcutsHelp),
  { ssr: false }
);
const CreateProjectDialog = dynamic(
  () =>
    import("@/components/projects/CreateProjectDialog").then(
      (mod) => mod.CreateProjectDialog
    ),
  { ssr: false }
);
const FloatingTimer = dynamic(
  () => import("@/components/FloatingTimer").then((mod) => mod.FloatingTimer),
  { ssr: false }
);

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellContent({ children }: AppShellProps) {
  const pathname = usePathname();
  const isFocus = pathname === "/focus";
  const hideMobileNav = pathname === "/focus" || pathname === "/settings";
  const isTasksPage = pathname === "/";
  const { isAddTaskOpen, openAddTask, closeAddTask } = useTaskActions();
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
                  "left-0 right-0 px-4 top-[72px]", // Mobile: Floating comfortably below header
                  "md:left-[var(--sidebar-width)] md:px-0 md:top-4 md:right-6 md:justify-end" // Desktop: Floating top-right banner
                )}
              >
                <div className="pointer-events-auto flex items-center justify-between w-full max-w-[500px] md:w-[350px] bg-sidebar border border-border text-foreground text-[13px] font-medium py-2.5 px-4 rounded-xl shadow-2xl shadow-black/5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
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
            className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden md:pt-0 md:pb-0",
              !hideMobileNav && "pt-16"
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

        {/* FAB - Only on Tasks page, rendered outside template animation */}
        {isTasksPage && <AddTaskFab onClick={openAddTask} />}

        {/* Global Task Sheet */}
        <TaskSheet open={isAddTaskOpen} onClose={closeAddTask} />
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
        {loading || !user || isLoginPage ? (
          <>{children}</>
        ) : (
          <AppShellContent>{children}</AppShellContent>
        )}
      </TaskActionsProvider>
    </ProjectActionsProvider>
  );
}
