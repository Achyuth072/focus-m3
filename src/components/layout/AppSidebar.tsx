'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  CheckSquare,
  Calendar,
  BarChart3,
  Timer,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { useCompletedTasks } from '@/components/CompletedTasksProvider';

const mainNavItems = [
  { label: 'Tasks', icon: CheckSquare, path: '/', isAction: false },
  { label: 'Calendar', icon: Calendar, path: '/calendar', isAction: false },
  { label: 'Stats', icon: BarChart3, path: '/stats', isAction: false },
];

const secondaryNavItems = [
  { label: 'Focus', icon: Timer, path: '/focus', isAction: false },
  { label: 'Settings', icon: Settings, path: '/settings', isAction: false },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const { openSheet } = useCompletedTasks();

  // Prefetch all routes on mount for instant navigation
  useEffect(() => {
    const allRoutes = [...mainNavItems, ...secondaryNavItems].map((item) => item.path);
    allRoutes.forEach((path) => router.prefetch(path));
  }, [router]);

  return (
    <Sidebar variant="sidebar" collapsible="none" className="h-screen border-r">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
            F
          </div>
          <span className="font-semibold text-lg">
            FocusM3
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {!isMobile && (
          <>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path && !item.isAction;
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          onClick={() => {
                            if (item.isAction) {
                              openSheet();
                            } else {
                              router.push(item.path);
                            }
                            if (isMobile) setOpenMobile(false);
                          }}
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />
          </>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems
                .filter((item) => isMobile ? item.label === 'Settings' : true)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        onClick={() => {
                          router.push(item.path);
                          if (isMobile) setOpenMobile(false);
                        }}
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <div className="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          v0.1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
