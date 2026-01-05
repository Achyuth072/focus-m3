'use client';

import { useHotkeys } from 'react-hotkeys-hook';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSidebar } from '@/components/ui/sidebar';
import { useTaskActions } from '@/components/TaskActionsProvider';
import { useCompletedTasks } from '@/components/CompletedTasksProvider';

interface GlobalHotkeysProps {
  setCommandOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setHelpOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export function GlobalHotkeys({ setCommandOpen, setHelpOpen }: GlobalHotkeysProps) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
  const { openAddTask } = useTaskActions();
  const { openSheet: openCompletedSheet } = useCompletedTasks();

  // Memoize options to prevent listener thrashing
  const options = {
    preventDefault: true,
    enableOnFormTags: false,
  };
  
  const aggressiveOptions = {
    preventDefault: true,
    enableOnFormTags: true,
  };

  // --- ACTIONS ---

  // New Task (n)
  useHotkeys('n', () => openAddTask(), options);

  // Toggle Logbook (c)
  useHotkeys('c', () => openCompletedSheet(), options);

  // Command Menu (s, Ctrl+K/Cmd+K)
  useHotkeys(['s', 'meta+k', 'ctrl+k'], () => setCommandOpen((prev) => !prev), options);

  // Sidebar Toggle (b)
  useHotkeys('b', () => toggleSidebar(), options);

  // Theme Cycle (t)
  useHotkeys('t', () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, options);

  // Shortcuts Help (Shift+H)
  useHotkeys(['shift+h', 'shift+/', '?'], () => setHelpOpen((prev) => !prev), options);
  
  // Focus Mode (f)
  useHotkeys('f', () => router.push('/focus'), options);

  // Escape to close Focus Mode (if on focus page) and other sheets
  useHotkeys('esc', () => {
    // If command menu or help is open, they handle their own close usually via Dialog primitive, 
    // but we can add safety checks if needed. 
    // Mainly for Focus Mode:
    if (window.location.pathname === '/focus') {
      router.push('/');
    }
  }, aggressiveOptions);

  // --- NAVIGATION (g + 1-5, or just 1-5?) ---
  // Using 1-5 for quick tab switching is standard
  useHotkeys('1', () => router.push('/'), options);         // Home/Tasks
  useHotkeys('2', () => router.push('/calendar'), options); // Calendar
  useHotkeys('3', () => router.push('/stats'), options);    // Statistics
  useHotkeys('4', () => router.push('/focus'), options);    // Focus
  useHotkeys('5', () => router.push('/settings'), options); // Settings

  return null;
}
