'use client';

import { Menu, MoreVertical, Timer } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useFocusTimer } from '@/lib/hooks/useFocusTimer';

export function MobileHeader() {
  const router = useRouter();
  const { state } = useFocusTimer();

  const minutes = Math.floor(state.remainingSeconds / 60);
  const seconds = state.remainingSeconds % 60;
  const displayTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 border-b bg-sidebar md:hidden">
      {/* Left: Hamburger Menu */}
      <SidebarTrigger className="h-10 w-10" />

      {/* Right: Focus Timer + More Menu */}
      <div className="flex items-center gap-2">
        {/* Dynamic Focus Timer */}
        <button
          onClick={() => router.push('/focus')}
          className="flex items-center gap-2 px-3 py-2 min-h-[48px] rounded-lg hover:bg-sidebar-accent transition-colors border border-transparent hover:border-border"
        >
          <Timer className={`h-5 w-5 ${state.isRunning ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          <span className={`text-base font-mono font-semibold tabular-nums ${state.isRunning ? 'text-primary' : 'text-muted-foreground'}`}>
            {displayTime}
          </span>
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
