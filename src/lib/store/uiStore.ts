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
  // Global Settings
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
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

      // Global Settings defaults
      hapticsEnabled: true,
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
    }),
    {
      name: "kanso-ui-state",
    }
  )
);
