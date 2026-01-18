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
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  // Shortcuts Help Dialog
  isShortcutsHelpOpen: boolean;
  setShortcutsHelpOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  // PIP State (for cross-hook communication)
  isPipActive: boolean;
  setIsPipActive: (active: boolean) => void;
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
      viewMode: "grid",
      setSortBy: (sort) => set({ sortBy: sort }),
      setGroupBy: (group) => set({ groupBy: group }),
      setViewMode: (mode) => set({ viewMode: mode }),

      // Global Settings defaults
      hapticsEnabled: true,
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
      notificationsEnabled: false,
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),

      // Shortcuts Help defaults
      isShortcutsHelpOpen: false,
      setShortcutsHelpOpen: (open) =>
        set((state) => ({
          isShortcutsHelpOpen:
            typeof open === "function"
              ? (open as (prev: boolean) => boolean)(state.isShortcutsHelpOpen)
              : open,
        })),

      // PIP State defaults
      isPipActive: false,
      setIsPipActive: (active) => set({ isPipActive: active }),
    }),
    {
      name: "kanso-ui-state",
      migrate: (persistedState: unknown, _version: number) => {
        const state = persistedState as Record<string, unknown> | undefined;
        // Migrate legacy "split" viewMode to "list"
        if (state?.viewMode === "split") {
          return { ...state, viewMode: "list" };
        }
        return state;
      },
    },
  ),
);
