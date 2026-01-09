"use client";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";
import { Keyboard } from "lucide-react";

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUTS: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["1"], description: "Go to Tasks" },
      { keys: ["2"], description: "Go to Calendar" },
      { keys: ["3"], description: "Go to Stats" },
      { keys: ["4"], description: "Go to Focus" },
      { keys: ["5"], description: "Go to Settings" },
      { keys: ["b"], description: "Toggle Sidebar" },
      { keys: ["Esc"], description: "Close Focus/Dialogs" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["n"], description: "New Task" },
      { keys: ["c"], description: "Toggle Logbook" },
      { keys: ["s"], description: "Search / Command Menu" },
      { keys: ["Ctrl", "k"], description: "Search / Command Menu" },
      { keys: ["t"], description: "Switch Theme" },
      { keys: ["f"], description: "Focus Mode" },
      { keys: ["Shift", "h"], description: "Show Shortcuts" },
    ],
  },
  {
    title: "View",
    shortcuts: [
      { keys: ["Shift", "1"], description: "List View" },
      { keys: ["Shift", "2"], description: "Grid View" },
      { keys: ["Shift", "3"], description: "Board View" },
    ],
  },
  {
    title: "Task List (Vim)",
    shortcuts: [
      { keys: ["j"], description: "Select Next Task" },
      { keys: ["k"], description: "Select Previous Task" },
      { keys: ["d"], description: "Delete Selected" },
      { keys: ["e"], description: "Edit Selected" },
      { keys: ["Space"], description: "Toggle Completion" },
    ],
  },
];

interface ShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsHelp({ open, onOpenChange }: ShortcutsHelpProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-[550px] border-border/60 shadow-2xl p-0">
        <ResponsiveDialogHeader className="p-6 pb-2 border-b border-border/40">
          <ResponsiveDialogTitle className="flex items-center gap-2.5 text-[22px] font-semibold tracking-tight text-foreground">
            <Keyboard className="h-5 w-5 text-muted-foreground/70" />
            Keyboard Shortcuts
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium pt-1">
            Refine your workflow with Kanso
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-hide p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {SHORTCUTS.map((group) => (
              <div key={group.title} className="space-y-4">
                <h3 className="text-[15px] font-bold tracking-tight text-foreground pb-2 border-b border-border/40">
                  {group.title}
                </h3>
                <div className="space-y-3.5">
                  {group.shortcuts.map((shortcut, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[14px]"
                    >
                      <span className="text-foreground/90 font-medium">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-2">
                        {shortcut.keys.map((key) => (
                          <kbd
                            key={key}
                            className="pointer-events-none h-5.5 min-w-[24px] select-none items-center justify-center rounded border border-border bg-sidebar px-1.5 font-mono text-[10px] font-bold text-foreground shadow-none flex"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
