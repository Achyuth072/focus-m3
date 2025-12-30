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
  ChevronDown,
} from 'lucide-react';
import { useCompletedTasks } from '@/components/CompletedTasksProvider';
import { useProjects } from '@/lib/hooks/useProjects';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { useUiStore } from '@/lib/store/uiStore';

const mainNavItems = [
  { label: 'All Tasks', icon: CheckSquare, path: '/', isAction: false },
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
  const { isProjectsOpen, toggleProjectsOpen } = useUiStore();

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
              K
            </div>
            <span className="font-semibold text-lg">
              Kanso
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems
                  .filter((item) => {
                    if (isMobile) {
                      return item.label !== 'Stats' && item.label !== 'Calendar';
                    }
                    return true;
                  })
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = item.label === 'All Tasks' 
                      ? pathname === item.path && (!currentProjectId || currentProjectId === 'all')
                      : pathname === item.path && !item.isAction;
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          onClick={() => {
                            if (item.isAction) {
                              openSheet();
                            } else {
                              if (item.label === 'All Tasks') {
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
                <SidebarGroupLabel className="cursor-pointer pr-10" onClick={toggleProjectsOpen}>
                  <FolderKanban />
                  <span className="flex-1">Projects</span>
                  <ChevronDown 
                    className={`h-4 w-4 shrink-0 translate-y-px transition-transform ${isProjectsOpen ? '' : '-rotate-90'}`} 
                  />
                </SidebarGroupLabel>
                <SidebarGroupAction title="Add Project" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                </SidebarGroupAction>
                {isProjectsOpen && (
                  <SidebarGroupContent>
                    <SidebarMenu className="pl-2">
                      {/* Inbox */}
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
                                className="h-3 w-3 rounded-full shrink-0 group-data-[size=lg]/menu-button:h-4 group-data-[size=lg]/menu-button:w-4"
                                style={{ backgroundColor: project.color }}
                              />
                              <span className="truncate">{project.name}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>



          {!isMobile && (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {secondaryNavItems.map((item) => {
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
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-border">
          {isMobile && (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    router.push('/settings');
                    setOpenMobile(false);
                  }}
                  isActive={pathname === '/settings'}
                  tooltip="Settings"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
          <div className="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            v0.1.0
          </div>
        </SidebarFooter>
      </Sidebar>

      <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </>
  );
}
