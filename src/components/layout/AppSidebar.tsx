"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
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
} from "lucide-react";
import { useCompletedTasks } from "@/components/CompletedTasksProvider";
import { useProjects } from "@/lib/hooks/useProjects";
import { useProjectActions } from "@/components/ProjectActionsProvider";
import { useUiStore } from "@/lib/store/uiStore";
import { useHaptic } from "@/lib/hooks/useHaptic";

const mainNavItems = [
  { label: "All Tasks", icon: CheckSquare, path: "/", isAction: false },
  { label: "Calendar", icon: Calendar, path: "/calendar", isAction: false },
  { label: "Stats", icon: BarChart3, path: "/stats", isAction: false },
];

const secondaryNavItems = [
  { label: "Focus", icon: Timer, path: "/focus", isAction: false },
  { label: "Settings", icon: Settings, path: "/settings", isAction: false },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, setOpenMobile } = useSidebar();
  const { openSheet } = useCompletedTasks();
  const { data: projects } = useProjects();
  const { openCreateProject } = useProjectActions();
  const { isProjectsOpen, toggleProjectsOpen } = useUiStore();
  const { trigger } = useHaptic();

  const currentProjectId = searchParams.get("project");

  // Prefetch all routes on mount for instant navigation
  useEffect(() => {
    const allRoutes = [...mainNavItems, ...secondaryNavItems].map(
      (item) => item.path
    );
    allRoutes.forEach((path) => router.prefetch(path));
  }, [router]);

  const handleProjectClick = (projectId: string | "inbox") => {
    trigger(25);
    router.push(`/?project=${projectId}`);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="h-screen border-r md:border-none"
      >
        <SidebarHeader className="border-b border-border">
          <div className="flex items-center justify-between px-2 group-data-[collapsible=icon]:px-0 py-4 transition-all duration-300">
            <div className="flex items-center gap-2 overflow-hidden shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold shrink-0">
                K
              </div>
              <span className="type-h2 whitespace-nowrap transition-all duration-300 ease-in-out group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden">
                Kanso
              </span>
            </div>
            <SidebarTrigger className="h-8 w-8 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden shrink-0" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems
                  .filter((item) => {
                    if (isMobile) {
                      return (
                        item.label !== "Stats" && item.label !== "Calendar"
                      );
                    }
                    return true;
                  })
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.label === "All Tasks"
                        ? pathname === item.path &&
                          (!currentProjectId || currentProjectId === "all")
                        : pathname === item.path && !item.isAction;
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          onClick={() => {
                            trigger(20);
                            if (item.isAction) {
                              openSheet();
                            } else {
                              if (item.label === "All Tasks") {
                                router.push("/?project=all");
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
            <SidebarGroupLabel
              className="cursor-pointer pr-10"
              onClick={() => {
                trigger(15);
                toggleProjectsOpen();
              }}
            >
              <FolderKanban />
              <span className="flex-1">Projects</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 translate-y-px transition-transform ${
                  isProjectsOpen ? "" : "-rotate-90"
                }`}
              />
            </SidebarGroupLabel>
            <SidebarGroupAction
              title="Add Project"
              onClick={() => {
                trigger(20);
                openCreateProject();
              }}
            >
              <Plus className="h-4 w-4" />
            </SidebarGroupAction>
            {isProjectsOpen && (
              <SidebarGroupContent>
                <SidebarMenu className="pl-2 group-data-[collapsible=icon]:pl-0">
                  {/* Inbox */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleProjectClick("inbox")}
                      isActive={currentProjectId === "inbox"}
                      tooltip="Inbox"
                    >
                      <div className="flex items-center justify-center w-5 h-5 shrink-0">
                        <Inbox className="h-4 w-4" />
                      </div>
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
                          <div className="flex items-center justify-center w-5 h-5 shrink-0">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                          </div>
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
                            trigger(20);
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
                  asChild
                  isActive={pathname === "/settings"}
                  tooltip="Settings"
                >
                  <Link
                    href="/settings"
                    onClick={() => {
                      trigger(20);
                    }}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
          {/* Expand trigger - visible only when collapsed */}
          <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
            <SidebarTrigger className="h-8 w-8" />
          </div>
          <div className="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            v1.5.0
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
