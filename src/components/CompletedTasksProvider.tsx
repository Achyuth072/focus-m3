'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CompletedTasksContextValue {
  showCompleted: boolean;
  toggleShowCompleted: () => void;
}

const CompletedTasksContext = createContext<CompletedTasksContextValue | null>(null);

export function CompletedTasksProvider({ children }: { children: ReactNode }) {
  const [showCompleted, setShowCompleted] = useState(false);

  const toggleShowCompleted = () => {
    setShowCompleted((prev) => !prev);
  };

  return (
    <CompletedTasksContext.Provider value={{ showCompleted, toggleShowCompleted }}>
      {children}
    </CompletedTasksContext.Provider>
  );
}

export function useCompletedTasks() {
  const context = useContext(CompletedTasksContext);
  if (!context) {
    throw new Error('useCompletedTasks must be used within a CompletedTasksProvider');
  }
  return context;
}
