"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CalendarIcon,
  HomeIcon,
  LaptopIcon,
  LayoutGridIcon,
  MoonIcon,
  PlusIcon,
  SettingsIcon,
  SunIcon,
  HashIcon,
  CheckCircle2,
  Columns,
  LogOut,
  Inbox,
  FolderPlus,
  Keyboard,
  Monitor,
  Copy,
  Check,
  ListFilter,
  Layers,
  Clock,
  Filter,
  Command as CommandIcon,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useProjects } from "@/lib/hooks/useProjects";
import { useTaskActions } from "@/components/TaskActionsProvider";
import { useProjectActions } from "@/components/ProjectActionsProvider";
import { useCompletedTasks } from "@/components/CompletedTasksProvider";
import { useAuth } from "@/components/AuthProvider";
import { useSidebar } from "@/components/ui/sidebar";
import { SignOutConfirmation } from "@/components/auth/SignOutConfirmation";
import { useDocumentPiP } from "@/lib/hooks/useDocumentPiP";
import { useUiStore } from "@/lib/store/uiStore";
import { useBackNavigation } from "@/lib/hooks/useBackNavigation";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  // const [open, setOpen] = React.useState(false) // Controlled by parent
  const [showSignOutConfirm, setShowSignOutConfirm] = React.useState(false);
  const { setTheme } = useTheme();
  const { data: projects } = useProjects();
  const { openAddTask } = useTaskActions();
  const { openCreateProject } = useProjectActions();
  const { openSheet: openCompletedSheet } = useCompletedTasks();
  const { user, signOut } = useAuth();
  const { toggleSidebar } = useSidebar();
  const { openPiP, closePiP, isPiPActive } = useDocumentPiP();
  const { setShortcutsHelpOpen, setSortBy, setGroupBy } = useUiStore();
  const [copied, setCopied] = React.useState(false);

  // Handle back navigation to close command menu instead of navigating away
  // Handle back navigation to close command menu instead of navigating away
  useBackNavigation(open, () => onOpenChange(false));

  // Internal shortcut listener removed in favor of GlobalHotkeys

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  return (
    <>
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <div className="p-6 pb-3 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <CommandIcon className="h-5 w-5 text-muted-foreground/70" />
            <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
              Command Menu
            </h2>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium pt-1">
            Quick Actions & Navigation
          </p>
        </div>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => runCommand(() => openAddTask())}>
              <PlusIcon className="mr-2 h-4 w-4" />
              <span>New Task</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => openCreateProject())}>
              <FolderPlus className="mr-2 h-4 w-4" />
              <span>New Project</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => openCompletedSheet())}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>Show Completed Tasks</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  if (isPiPActive) closePiP();
                  else openPiP();
                })
              }
            >
              <Monitor className="mr-2 h-4 w-4" />
              <span>
                {isPiPActive ? "Close PiP Window" : "Open PiP Window"}
              </span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => toggleSidebar())}>
              <Columns className="mr-2 h-4 w-4" />
              <span>Toggle Sidebar</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Focus Sessions">
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/focus?duration=25"))
              }
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>Pomodoro (25m)</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/focus?duration=50"))
              }
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>Deep Work (50m)</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="View Options">
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  setSortBy("date");
                  router.push("/");
                })
              }
            >
              <ListFilter className="mr-2 h-4 w-4" />
              <span>Sort by Date</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  setSortBy("priority");
                  router.push("/");
                })
              }
            >
              <ListFilter className="mr-2 h-4 w-4" />
              <span>Sort by Priority</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  setGroupBy("project");
                  router.push("/");
                })
              }
            >
              <Layers className="mr-2 h-4 w-4" />
              <span>Group by Project</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  setGroupBy("none");
                  router.push("/");
                })
              }
            >
              <Layers className="mr-2 h-4 w-4" />
              <span>Ungroup Tasks</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <HomeIcon className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            {/* Inbox moved to projects */}
            <CommandItem
              onSelect={() => runCommand(() => router.push("/calendar"))}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/stats"))}
            >
              <LayoutGridIcon className="mr-2 h-4 w-4" />
              <span>Statistics</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Filters">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/?filter=today"))}
            >
              <Filter className="mr-2 h-4 w-4" />
              <span>Due Today</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/?filter=p1"))}
            >
              <Filter className="mr-2 h-4 w-4" />
              <span>High Priority</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <PlusIcon className="mr-2 h-4 w-4 rotate-45" />
              <span>Clear all filters</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <SunIcon className="mr-2 h-4 w-4" />
              <span>Light</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <MoonIcon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <LaptopIcon className="mr-2 h-4 w-4" />
              <span>System</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Projects">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/?project=inbox"))}
            >
              <Inbox className="mr-2 h-4 w-4" />
              <span>Inbox</span>
            </CommandItem>
            {projects
              ?.filter((p) => !p.is_inbox)
              .map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() => {
                    runCommand(() => router.push(`/?project=${project.id}`));
                  }}
                >
                  <HashIcon className="mr-2 h-4 w-4" />
                  <span>{project.name}</span>
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Account">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/settings"))}
            >
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setShortcutsHelpOpen(true))}
            >
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard Shortcuts</span>
            </CommandItem>
            {user && (
              <CommandItem
                onSelect={() =>
                  runCommand(() => {
                    navigator.clipboard.writeText(user.id);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  })
                }
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                <span>Copy My User ID</span>
              </CommandItem>
            )}
            <CommandItem
              onSelect={() => runCommand(() => setShowSignOutConfirm(true))}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <SignOutConfirmation
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={() => {
          signOut();
          setShowSignOutConfirm(false);
        }}
      />
    </>
  );
}
