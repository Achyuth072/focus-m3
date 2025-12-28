'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarGroupAction,
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
  Plus,
  Inbox,
  FolderKanban,
} from 'lucide-react';
import { useCompletedTasks } from '@/components/CompletedTasksProvider';
import { useProjects } from '@/lib/hooks/useProjects';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';

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
  const searchParams = useSearchParams();
  const { isMobile, setOpenMobile } = useSidebar();
  const { openSheet } = useCompletedTasks();
  const { data: projects } = useProjects();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const currentProjectId = searchParams.get('project');

  // Prefetch all routes on mount for instant navigation
  useEffect(() => {
    const allRoutes = [...mainNavItems, ...secondaryNavItems].map((item) => item.path);
    allRoutes.forEach((path) => router.prefetch(path));
  }, [router]);

  const handleProjectClick = (projectId: string | 'inbox') => {
    router.push(`/?project=${projectId}`);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <>
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
                      // Tasks is active when on home with no project filter (showing all)
                      const isActive = item.label === 'Tasks' 
                        ? pathname === item.path && (!currentProjectId || currentProjectId === 'all')
                        : pathname === item.path && !item.isAction;
                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton
                            onClick={() => {
                              if (item.isAction) {
                                openSheet();
                              } else {
                                // For Tasks, navigate to home without project filter (shows all)
                                if (item.label === 'Tasks') {
                                  router.push('/?project=all');
                                } else {
                                  router.push(item.path);
                                }
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

              {/* Projects Section */}
              <SidebarGroup>
                <SidebarGroupLabel>
                  <FolderKanban className="h-4 w-4 mr-2" />
                  Projects
                </SidebarGroupLabel>
                <SidebarGroupAction title="Add Project" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                </SidebarGroupAction>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {/* Inbox (No Project) */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => handleProjectClick('inbox')}
                        isActive={currentProjectId === 'inbox'}
                        tooltip="Inbox"
                      >
                        <Inbox className="h-4 w-4" />
                        <span>Inbox</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* User Projects */}
                    {projects
                      ?.filter((p) => !p.is_inbox)
                      .map((project) => (
                        <SidebarMenuItem key={project.id}>
                          <SidebarMenuButton
                            onClick={() => handleProjectClick(project.id)}
                            isActive={currentProjectId === project.id}
                            tooltip={project.name}
                          >
                            <div
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="truncate">{project.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
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

      <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </>
  );
}
