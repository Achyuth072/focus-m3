"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  EllipsisVertical,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { isMobile, setOpenMobile, state } = useSidebar();
  const { openSheet } = useCompletedTasks();
  const { data: projects } = useProjects();
  const { openCreateProject, openEditProject, openDeleteProject } =
    useProjectActions();
  const { isProjectsOpen, toggleProjectsOpen } = useUiStore();
  const { trigger } = useHaptic();

  const [mobileActionProject, setMobileActionProject] =
    useState<Project | null>(null);
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
          <div className="flex items-center py-2 h-[60px]">
            {/* K logo — always in-flow, centers naturally in 48px icon-width sidebar when collapsed */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold shrink-0">
              K
            </div>
            {/* Label + trigger animate in/out with same Seijaku spring as the project list */}
            <AnimatePresence initial={false}>
              {state === "expanded" && (
                <motion.div
                  key="header-expanded"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: "spring", mass: 1, stiffness: 280, damping: 60 }}
                  className="flex items-center justify-between overflow-hidden ml-2 flex-1"
                  style={{ minWidth: 0 }}
                >
                  <span className="type-h2 whitespace-nowrap">Kanso</span>
                  <SidebarTrigger className="h-8 w-8 shrink-0 bg-secondary/40 hover:bg-secondary/60 border border-border/50 shadow-none active:scale-95 transition-all" />
                </motion.div>
              )}
            </AnimatePresence>
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
                                setTimeout(() => setOpenMobile(false), 150);
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
              className="cursor-pointer pr-10 text-sidebar-foreground [&_svg]:opacity-100"
              onClick={() => {
                trigger("MEDIUM");
                toggleProjectsOpen();
              }}
            >
              <FolderKanban strokeWidth={2.25} />
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
            <AnimatePresence initial={false}>
              {isProjectsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", mass: 1, stiffness: 280, damping: 60 }}
                  className="overflow-hidden"
                >
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
                            onClick={() => {
                              trigger("MEDIUM");
                              if (isMobile) {
                                setTimeout(() => setOpenMobile(false), 150);
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
                                onClick={() => {
                                  trigger("MEDIUM");
                                  if (isMobile) {
                                    setTimeout(() => setOpenMobile(false), 150);
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
                            {/* Project Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction
                                  showOnHover={!isMobile}
                                  className="peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
                                  onClick={(e) => {
                                    if (isMobile) {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      trigger("MEDIUM");
                                      setMobileActionProject(project);
                                    }
                                  }}
                                >
                                  <EllipsisVertical className="h-4 w-4" />
                                  <span className="sr-only">More</span>
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              {!isMobile && (
                                <DropdownMenuContent
                                  side="right"
                                  align="start"
                                  className="w-48"
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      trigger("MEDIUM");
                                      openEditProject(project);
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span>Edit Project</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      trigger("WARNING");
                                      openDeleteProject(project);
                                    }}
                                    className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete Project</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              )}
                            </DropdownMenu>
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
                </motion.div>
              )}
            </AnimatePresence>
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

        <SidebarFooter className="border-t border-border overflow-hidden">
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
                      trigger("MEDIUM");
                      if (isMobile) {
                        setTimeout(() => setOpenMobile(false), 150);
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
          
          <div className="h-[48px] relative flex flex-col justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              {state === "collapsed" && !isMobile ? (
                <motion.div
                  key="footer-collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.05 } }}
                  transition={{ duration: 0.15 }}
                  className="flex justify-center w-full"
                >
                  <SidebarTrigger className="h-8 w-8 bg-secondary/40 hover:bg-secondary/60 border border-border/50 shadow-none active:scale-95 transition-all" />
                </motion.div>
              ) : state === "expanded" && !isMobile ? (
                <motion.div
                  key="footer-expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.05 } }}
                  transition={{ duration: 0.15 }}
                  className="px-4 py-3 text-xs text-muted-foreground font-medium tracking-tight w-full"
                >
                  v1.14.0
                </motion.div>
              ) : null}
            </AnimatePresence>
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
                  if (mobileActionProject)
                    openDeleteProject(mobileActionProject);
                }}
              >
                Delete Project
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => trigger("LIGHT")}
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
