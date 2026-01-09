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
  viewMode: "list" | "grid" | "board";
  setSortBy: (sort: SortOption) => void;
  setGroupBy: (group: GroupOption) => void;
  setViewMode: (mode: "list" | "grid" | "board") => void;
  // Global Settings
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;

  // Shortcuts Help Dialog
  isShortcutsHelpOpen: boolean;
  setShortcutsHelpOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
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
      viewMode: "list",
      setSortBy: (sort) => set({ sortBy: sort }),
      setGroupBy: (group) => set({ groupBy: group }),
      setViewMode: (mode) => set({ viewMode: mode }),

      // Global Settings defaults
      hapticsEnabled: true,
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),

      // Shortcuts Help defaults
      isShortcutsHelpOpen: false,
      setShortcutsHelpOpen: (open) =>
        set((state) => ({
          isShortcutsHelpOpen:
            typeof open === "function"
              ? (open as (prev: boolean) => boolean)(state.isShortcutsHelpOpen)
              : open,
        })),
    }),
    {
      name: "kanso-ui-state",
    }
  )
);
