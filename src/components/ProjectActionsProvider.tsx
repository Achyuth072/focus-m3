'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectActionsContextValue {
  isCreateProjectOpen: boolean;
  openCreateProject: () => void;
  closeCreateProject: () => void;
}

const ProjectActionsContext = createContext<ProjectActionsContextValue | null>(null);

export function ProjectActionsProvider({ children }: { children: ReactNode }) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const openCreateProject = () => setIsCreateProjectOpen(true);
  const closeCreateProject = () => setIsCreateProjectOpen(false);

  return (
    <ProjectActionsContext.Provider 
      value={{ 
        isCreateProjectOpen,
        openCreateProject, 
        closeCreateProject 
      }}
    >
      {children}
    </ProjectActionsContext.Provider>
  );
}

export function useProjectActions() {
  const context = useContext(ProjectActionsContext);
  if (!context) {
    throw new Error('useProjectActions must be used within a ProjectActionsProvider');
  }
  return context;
}
