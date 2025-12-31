'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TaskActionsContextValue {
  isAddTaskOpen: boolean;
  openAddTask: () => void;
  closeAddTask: () => void;
}

const TaskActionsContext = createContext<TaskActionsContextValue | null>(null);

export function TaskActionsProvider({ children }: { children: ReactNode }) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const openAddTask = () => setIsAddTaskOpen(true);
  const closeAddTask = () => setIsAddTaskOpen(false);

  return (
    <TaskActionsContext.Provider 
      value={{ 
        isAddTaskOpen,
        openAddTask, 
        closeAddTask 
      }}
    >
      {children}
    </TaskActionsContext.Provider>
  );
}

export function useTaskActions() {
  const context = useContext(TaskActionsContext);
  if (!context) {
    throw new Error('useTaskActions must be used within a TaskActionsProvider');
  }
  return context;
}
