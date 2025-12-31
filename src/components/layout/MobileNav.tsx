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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-colors min-w-[60px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
