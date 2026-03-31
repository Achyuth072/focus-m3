"use client";

import {
  CheckCircle2,
  ListFilter,
  Plus,
  LayoutGrid,
  KanbanSquare,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompletedTasks } from "@/components/CompletedTasksProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GroupOption,
  SortOption,
  GROUP_LABELS,
  SORT_LABELS,
} from "@/lib/types/sorting";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { useHotkeys } from "react-hotkeys-hook";
import { SyncIndicator } from "@/components/ui/SyncIndicator";

interface TasksPageHeaderProps {
  currentSort: SortOption;
  currentGroup: GroupOption;
  viewMode: "list" | "grid" | "board";
  onSortChange: (sort: SortOption) => void;
  onGroupChange: (group: GroupOption) => void;
  onViewModeChange: (mode: "list" | "grid" | "board") => void;
  onNewTask?: () => void;
}

export function TasksPageHeader({
  currentSort,
  currentGroup,
  viewMode,
  onSortChange,
  onGroupChange,
  onViewModeChange,
  onNewTask,
}: TasksPageHeaderProps) {
  const { openSheet } = useCompletedTasks();
  const { trigger } = useHaptic();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const isFilterActive = currentSort !== "date" || currentGroup !== "none";

  return (
    <div className="flex items-center gap-2">
      <SyncIndicator />
      <div className="flex h-10 items-stretch overflow-hidden rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm shadow-none md:h-9">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-full w-8 p-0 rounded-none transition-all duration-200 border-r border-input/50 last:border-r-0",
            viewMode === "grid"
              ? "bg-brand text-white shadow-none"
              : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60",
          )}
          onClick={() => {
            trigger("MEDIUM");
            onViewModeChange("grid");
          }}
          title="Grid View (Shift+1)"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        {isDesktop && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-full w-8 p-0 rounded-none transition-all duration-200 border-r border-input/50 last:border-r-0",
              viewMode === "board"
                ? "bg-brand text-white shadow-none"
                : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60",
            )}
            onClick={() => {
              trigger("MEDIUM");
              onViewModeChange("board");
            }}
            title="Board View (Shift+2)"
          >
            <KanbanSquare className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-full w-8 p-0 rounded-none transition-all duration-200 border-r border-input/50 last:border-r-0",
            viewMode === "list"
              ? "bg-brand text-white shadow-none"
              : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60",
          )}
          onClick={() => {
            trigger("MEDIUM");
            onViewModeChange("list");
          }}
          title="List View (Shift+3)"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 relative bg-secondary/40 hover:bg-secondary/60 border border-border/50",
              isFilterActive && "border-brand/50",
            )}
            onPointerDown={() => trigger("TAP")}
          >
            <ListFilter
              className={cn("h-4 w-4", isFilterActive && "text-brand")}
            />
            {isFilterActive && (
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-brand" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currentSort}
            onValueChange={(v) => onSortChange(v as SortOption)}
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <DropdownMenuRadioItem
                key={value}
                value={value}
                onClick={() => trigger("MEDIUM")}
              >
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Group By</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currentGroup}
            onValueChange={(v) => onGroupChange(v as GroupOption)}
          >
            {Object.entries(GROUP_LABELS).map(([value, label]) => (
              <DropdownMenuRadioItem
                key={value}
                value={value}
                onClick={() => trigger("MEDIUM")}
              >
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        onClick={openSheet}
        className="hidden md:flex items-center gap-2 bg-secondary/40 hover:bg-secondary/60 border border-border/50"
      >
        <CheckCircle2 className="h-4 w-4" />
        Completed
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onNewTask}
        className="hidden md:flex items-center gap-2 bg-secondary/40 hover:bg-secondary/60 border border-border/50"
      >
        <Plus className="h-4 w-4" />
        New Task
      </Button>
    </div>
  );
}
