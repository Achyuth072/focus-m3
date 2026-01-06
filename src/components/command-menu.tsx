"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
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
  Clock,
  Filter,
  Inbox,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useProjects } from "@/lib/hooks/useProjects"
import { useTaskActions } from "@/components/TaskActionsProvider"
import { useCompletedTasks } from "@/components/CompletedTasksProvider"
import { useAuth } from "@/components/AuthProvider"
import { useSidebar } from "@/components/ui/sidebar"
import { SignOutConfirmation } from "@/components/auth/SignOutConfirmation"

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter()
  // const [open, setOpen] = React.useState(false) // Controlled by parent
  const [showSignOutConfirm, setShowSignOutConfirm] = React.useState(false)
  const { setTheme } = useTheme()
  const { data: projects } = useProjects()
  const { openAddTask } = useTaskActions()
  const { openSheet: openCompletedSheet } = useCompletedTasks()
  const { signOut } = useAuth()
  const { toggleSidebar } = useSidebar()
  
  // Internal shortcut listener removed in favor of GlobalHotkeys


  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false)
    command()
  }, [onOpenChange])

  return (
    <>
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => runCommand(() => openAddTask())}>
              <PlusIcon className="mr-2 h-4 w-4" />
              <span>New Task</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => openCompletedSheet())}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>Show Completed Tasks</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => toggleSidebar())}>
              <Columns className="mr-2 h-4 w-4" />
              <span>Toggle Sidebar</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Focus Sessions">
            <CommandItem onSelect={() => runCommand(() => router.push("/focus?duration=25"))}>
              <Clock className="mr-2 h-4 w-4" />
              <span>Pomodoro (25m)</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/focus?duration=50"))}>
              <Clock className="mr-2 h-4 w-4" />
              <span>Deep Work (50m)</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <HomeIcon className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            {/* Inbox moved to projects */}
            <CommandItem onSelect={() => runCommand(() => router.push("/calendar"))}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/stats"))}>
              <LayoutGridIcon className="mr-2 h-4 w-4" />
              <span>Statistics</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Filters">
            <CommandItem onSelect={() => runCommand(() => router.push("/?filter=today"))}>
              <Filter className="mr-2 h-4 w-4" />
              <span>Due Today</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/?filter=p1"))}>
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
              <CommandItem onSelect={() => runCommand(() => router.push("/?project=inbox"))}>
                  <Inbox className="mr-2 h-4 w-4" />
                  <span>Inbox</span>
              </CommandItem>
              {projects
                  ?.filter(p => !p.is_inbox)
                  .map((project) => (
                    <CommandItem
                      key={project.id}
                      onSelect={() => {
                          runCommand(() => router.push(`/?project=${project.id}`))
                      }}
                    >
                      <HashIcon className="mr-2 h-4 w-4" />
                      <span>{project.name}</span>
                    </CommandItem>
                  ))}
          </CommandGroup>

          <CommandSeparator />
          
          <CommandGroup heading="Account">
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setShowSignOutConfirm(true))}>
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
  )
}

