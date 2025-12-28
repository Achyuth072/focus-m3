'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CompletedTasksSheet } from '@/components/tasks/CompletedTasksSheet';

interface CompletedTasksContextValue {
  showCompleted: boolean;
  toggleShowCompleted: () => void;
  isSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}

const CompletedTasksContext = createContext<CompletedTasksContextValue | null>(null);

export function CompletedTasksProvider({ children }: { children: ReactNode }) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const toggleShowCompleted = () => {
    setShowCompleted((prev) => !prev);
  };

  const openSheet = () => setIsSheetOpen(true);
  const closeSheet = () => setIsSheetOpen(false);

  return (
    <CompletedTasksContext.Provider 
      value={{ 
        showCompleted, 
        toggleShowCompleted, 
        isSheetOpen, 
        openSheet, 
        closeSheet 
      }}
    >
      {children}
      <CompletedTasksSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
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
