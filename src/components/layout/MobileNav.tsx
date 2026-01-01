'use client';

import { usePathname, useRouter } from 'next/navigation';
import { CheckSquare, Calendar, BarChart3, Timer, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'All Tasks', icon: CheckSquare, path: '/' },
  { label: 'Calendar', icon: Calendar, path: '/calendar' },
  { label: 'Stats', icon: BarChart3, path: '/stats' },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-sidebar md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-[60px] pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all active:scale-95',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                "p-1 rounded-full overflow-hidden transition-colors",
                isActive && "bg-secondary/50"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-[13px] font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
