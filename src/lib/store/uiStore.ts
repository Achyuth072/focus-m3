"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GroupOption, SortOption } from "@/lib/types/sorting";

interface UiState {
  // Sidebar State
  isProjectsOpen: boolean;
  toggleProjectsOpen: () => void;

  // Task List State
  sortBy: SortOption;
  groupBy: GroupOption;
  setSortBy: (sort: SortOption) => void;
  setGroupBy: (group: GroupOption) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      // Sidebar defaults
      isProjectsOpen: true,
      toggleProjectsOpen: () =>
        set((state) => ({ isProjectsOpen: !state.isProjectsOpen })),

      // Task List defaults
      sortBy: "date",
      groupBy: "none",
      setSortBy: (sort) => set({ sortBy: sort }),
      setGroupBy: (group) => set({ groupBy: group }),
    }),
    {
      name: "kanso-ui-state",
    }
  )
);
