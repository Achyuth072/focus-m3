"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "@/lib/types/task";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuAction,
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
  Layers,
  Timer,
  Settings,
  Plus,
  Inbox,
  FolderKanban,
  ChevronDown,
  Trash2,
  ArchiveRestore,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { useCompletedTasks } from "@/components/CompletedTasksProvider";
import { useProjects } from "@/lib/hooks/useProjects";
import { useProjectActions } from "@/components/ProjectActionsProvider";
import { useUiStore } from "@/lib/store/uiStore";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { ArchivedProjectsDialog } from "@/components/projects/ArchivedProjectsDialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { label: "All Tasks", icon: CheckSquare, path: "/", isAction: false },
  { label: "Habits", icon: Layers, path: "/habits", isAction: false },
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
   const {
    openCreateProject,
    openEditProject,
    openDeleteProject,
  } = useProjectActions();
  const { isProjectsOpen, toggleProjectsOpen } = useUiStore();
  const { trigger } = useHaptic();

  const [mobileActionProject, setMobileActionProject] = useState<Project | null>(
    null,
  );
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);

  const currentProjectId = searchParams.get("project");

  // Prefetch all routes on mount for instant navigation
  useEffect(() => {
    const allRoutes = [...mainNavItems, ...secondaryNavItems].map(
      (item) => item.path,
    );
    allRoutes.forEach((path) => router.prefetch(path));
  }, [router]);

  return (
    <>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="h-screen border-r"
      >
        <SidebarHeader className="border-b border-border">
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold shrink-0">
                K
              </div>
              <span className="type-h2 group-data-[collapsible=icon]:hidden">
                Kanso
              </span>
            </div>
            <SidebarTrigger className="h-8 w-8 group-data-[collapsible=icon]:hidden" />
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
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <Link
                            href={
                              item.label === "All Tasks"
                                ? "/?project=all"
                                : item.path
                            }
                            onClick={(e) => {
                              trigger("MEDIUM");
                              if (item.isAction) {
                                e.preventDefault();
                                openSheet();
                                if (isMobile) setOpenMobile(false);
                              } else if (isMobile) {
                                e.preventDefault();
                                setOpenMobile(false);
                                setTimeout(() => {
                                  router.push(
                                    item.label === "All Tasks"
                                      ? "/?project=all"
                                      : item.path,
                                  );
                                }, 50);
                              }
                            }}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
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
                trigger("MEDIUM");
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
                trigger("MEDIUM");
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
                      asChild
                      isActive={currentProjectId === "inbox"}
                      tooltip="Inbox"
                    >
                      <Link
                        href="/?project=inbox"
                        onClick={(e) => {
                          trigger("MEDIUM");
                          if (isMobile) {
                            e.preventDefault();
                            setOpenMobile(false);
                            setTimeout(
                              () => router.push("/?project=inbox"),
                              50,
                            );
                          }
                        }}
                      >
                        <div className="flex items-center justify-center w-5 h-5 shrink-0">
                          <Inbox className="h-4 w-4" />
                        </div>
                        <span>Inbox</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* User Projects */}
                  {projects
                    ?.filter((p) => !p.is_inbox)
                    .map((project) => (
                       <SidebarMenuItem key={project.id} className="relative">
                        <SidebarMenuButton
                          asChild
                          isActive={currentProjectId === project.id}
                          tooltip={project.name}
                          className="peer"
                        >
                          <Link
                            href={`/?project=${project.id}`}
                            onClick={(e) => {
                              trigger("MEDIUM");
                              if (isMobile) {
                                e.preventDefault();
                                setOpenMobile(false);
                                setTimeout(
                                  () => router.push(`/?project=${project.id}`),
                                  50,
                                );
                              }
                            }}
                          >
                            <div className="flex items-center justify-center w-5 h-5 shrink-0">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                            </div>
                            <span className="truncate">{project.name}</span>
                          </Link>
                        </SidebarMenuButton>

                        {/* Project Actions */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-end">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              trigger("MEDIUM");
                              setMobileActionProject(project);
                            }}
                            className="md:hidden p-1.5 rounded-md hover:bg-accent transition-colors active:scale-95"
                            aria-label="Project options"
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </button>

                          <div className="hidden md:flex items-center opacity-0 peer-hover:opacity-100 peer-focus-within:opacity-100 hover:opacity-100 focus-within:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden gap-0.5">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                trigger("MEDIUM");
                                openEditProject(project);
                              }}
                              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit Project"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                trigger("WARNING");
                                openDeleteProject(project);
                              }}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </SidebarMenuItem>
                    ))}

                  {/* Archived Projects */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        trigger("MEDIUM");
                        setIsArchivedOpen(true);
                      }}
                      tooltip="Archived Projects"
                    >
                      <div className="flex items-center justify-center w-5 h-5 shrink-0">
                        <ArchiveRestore className="h-4 w-4" />
                      </div>
                      <span className="truncate">Archived Projects</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <Link
                            href={item.path}
                            onClick={() => {
                              trigger("MEDIUM");
                            }}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
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
                    onClick={(e) => {
                      trigger("MEDIUM");
                      if (isMobile) {
                        e.preventDefault();
                        setOpenMobile(false);
                        setTimeout(() => router.push("/settings"), 50);
                      }
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
            v1.11.0
          </div>
        </SidebarFooter>
      </Sidebar>
       <ArchivedProjectsDialog
        open={isArchivedOpen}
        onOpenChange={setIsArchivedOpen}
      />

      {/* Mobile Project Action Drawer */}
      <Drawer
        open={!!mobileActionProject}
        onOpenChange={(open) => !open && setMobileActionProject(null)}
      >
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{mobileActionProject?.name}</DrawerTitle>
            <DrawerDescription>What would you like to do?</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  trigger("MEDIUM");
                  if (mobileActionProject) openEditProject(mobileActionProject);
                }}
              >
                Edit Project
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button
                variant="destructive"
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  trigger("WARNING");
                  if (mobileActionProject) openDeleteProject(mobileActionProject);
                }}
              >
                Delete Project
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full" onClick={() => trigger("LIGHT")}>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
