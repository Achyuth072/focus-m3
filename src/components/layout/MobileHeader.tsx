'use client';

import { MoreVertical, Timer, CheckCircle2, Settings as SettingsIcon } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter, usePathname } from 'next/navigation';
import { useTimer } from "@/components/TimerProvider";
import { useCompletedTasks } from '@/components/CompletedTasksProvider';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Task } from '@/lib/types/task';
import { useHaptic } from '@/lib/hooks/useHaptic';

export function MobileHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useTimer();
  const { openSheet } = useCompletedTasks();
  const supabase = createClient();
  const { trigger } = useHaptic();

  // Fetch active task if one is set
  const { data: activeTask } = useQuery({
    queryKey: ['task', state.activeTaskId],
    queryFn: async () => {
      if (!state.activeTaskId) return null;
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', state.activeTaskId)
        .single();
      return data as Task | null;
    },
    enabled: !!state.activeTaskId,
  });

  const minutes = Math.floor(state.remainingSeconds / 60);
  const seconds = state.remainingSeconds % 60;
  const displayTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const isTasksPage = pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 pt-[env(safe-area-inset-top)] border-b bg-sidebar md:hidden">
      {/* Left: Hamburger Menu */}
      <SidebarTrigger className="h-10 w-10 active:scale-95 transition-transform" />

      {/* Right: Focus Timer + More Menu */}
      <div className="flex items-center gap-2">
        {/* Dynamic Focus Timer */}
        <button
          onClick={() => {
            trigger(30);
            router.push('/focus');
          }}
          className="flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-lg hover:bg-sidebar-accent active:bg-sidebar-accent active:scale-95 transition-all"
        >
          <Timer className={`h-5 w-5 ${state.isRunning ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          <div className="flex flex-col items-start">
            <span className={`text-base font-mono font-semibold tabular-nums leading-none ${state.isRunning ? 'text-primary' : 'text-muted-foreground'}`}>
              {displayTime}
            </span>
            {activeTask && (
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {activeTask.content}
              </span>
            )}
          </div>
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 active:scale-95 transition-transform">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isTasksPage && (
              <>
                <DropdownMenuItem onClick={() => {
                  trigger(20);
                  openSheet();
                }}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Completed Tasks
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => {
              trigger(20);
              router.push('/settings');
            }}>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
