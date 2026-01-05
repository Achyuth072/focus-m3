'use client';

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';
import { Keyboard } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUTS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['1'], description: 'Go to Tasks' },
      { keys: ['2'], description: 'Go to Calendar' },
      { keys: ['3'], description: 'Go to Stats' },
      { keys: ['4'], description: 'Go to Focus' },
      { keys: ['5'], description: 'Go to Settings' },
      { keys: ['b'], description: 'Toggle Sidebar' },
      { keys: ['Esc'], description: 'Close Focus/Dialogs' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['n'], description: 'New Task' },
      { keys: ['c'], description: 'Toggle Logbook' },
      { keys: ['s'], description: 'Search / Command Menu' },
      { keys: ['Ctrl', 'k'], description: 'Search / Command Menu' },
      { keys: ['t'], description: 'Switch Theme' },
      { keys: ['f'], description: 'Focus Mode' },
      { keys: ['Shift', 'h'], description: 'Show Shortcuts' },
    ],
  },
  {
    title: 'Task List (Vim)',
    shortcuts: [
      { keys: ['j'], description: 'Select Next Task' },
      { keys: ['k'], description: 'Select Previous Task' },
      { keys: ['d'], description: 'Delete Selected' },
      { keys: ['e'], description: 'Edit Selected' },
      { keys: ['Space'], description: 'Toggle Completion' },
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
      <ResponsiveDialogContent className="sm:max-w-[600px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Master Kanso with these efficient shortcuts.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {SHORTCUTS.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground/80">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 flex"
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
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
