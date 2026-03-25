"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Project } from "@/lib/types/task";

interface ProjectActionsContextValue {
  isCreateProjectOpen: boolean;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  // New edit/delete actions
  activeProject: Project | null;
  actionType: "edit" | "delete" | null;
  openEditProject: (project: Project) => void;
  openDeleteProject: (project: Project) => void;
  closeProjectAction: () => void;
}

const ProjectActionsContext = createContext<ProjectActionsContextValue | null>(
  null,
);

export function ProjectActionsProvider({ children }: { children: ReactNode }) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [actionType, setActionType] = useState<"edit" | "delete" | null>(null);

  const openCreateProject = () => setIsCreateProjectOpen(true);
  const closeCreateProject = () => setIsCreateProjectOpen(false);

  const openEditProject = (project: Project) => {
    setActiveProject(project);
    setActionType("edit");
  };

  const openDeleteProject = (project: Project) => {
    setActiveProject(project);
    setActionType("delete");
  };

  const closeProjectAction = () => {
    setActiveProject(null);
    setActionType(null);
  };

  return (
    <ProjectActionsContext.Provider
      value={{
        isCreateProjectOpen,
        openCreateProject,
        closeCreateProject,
        activeProject,
        actionType,
        openEditProject,
        openDeleteProject,
        closeProjectAction,
      }}
    >
      {children}
    </ProjectActionsContext.Provider>
  );
}

export function useProjectActions() {
  const context = useContext(ProjectActionsContext);
  if (!context) {
    throw new Error(
      "useProjectActions must be used within a ProjectActionsProvider",
    );
  }
  return context;
}
