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
      <div className="flex h-8 items-stretch overflow-hidden rounded-lg border border-border bg-background shadow-none">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-full w-8 p-0 rounded-none transition-all duration-200 border-r border-input/50 last:border-r-0",
            viewMode === "list"
              ? "bg-brand/10 text-brand shadow-none"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80",
          )}
          onClick={() => {
            trigger("toggle");
            onViewModeChange("list");
          }}
          title="List View (Shift+1)"
        >
          <List className="h-4 w-4" strokeWidth={2.25} />
        </Button>
        {isDesktop && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-full w-8 p-0 rounded-none transition-all duration-200 border-r border-input/50 last:border-r-0",
              viewMode === "board"
                ? "bg-brand/10 text-brand shadow-none"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80",
            )}
            onClick={() => {
              trigger("toggle");
              onViewModeChange("board");
            }}
            title="Board View (Shift+2)"
          >
            <KanbanSquare className="h-4 w-4" strokeWidth={2.25} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-full w-8 p-0 rounded-none transition-all duration-200 border-r border-input/50 last:border-r-0",
            viewMode === "grid"
              ? "bg-brand/10 text-brand shadow-none"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80",
          )}
          onClick={() => {
            trigger("toggle");
            onViewModeChange("grid");
          }}
          title="Grid View (Shift+3)"
        >
          <LayoutGrid className="h-4 w-4" strokeWidth={2.25} />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 relative bg-secondary hover:bg-secondary/80 border border-border",
            )}
            onPointerDown={() => trigger("toggle")}
          >
            <ListFilter
              className={cn("h-4 w-4", isFilterActive && "text-brand")}
              strokeWidth={2.25}
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
                onClick={() => trigger("toggle")}
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
                onClick={() => trigger("toggle")}
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
        className="hidden md:flex items-center gap-2 bg-secondary hover:bg-secondary/80 border border-border"
      >
        <CheckCircle2
          className="h-4 w-4 text-foreground/70"
          strokeWidth={2.25}
        />
        Completed
      </Button>

      <Button
        size="sm"
        onClick={onNewTask}
        className="hidden md:flex h-9 items-center gap-2 rounded-lg bg-brand text-brand-foreground hover:bg-brand/90 border-none shadow-sm shadow-brand/10 transition-seijaku shrink-0"
      >
        <Plus className="h-4 w-4" strokeWidth={2.25} />
        <span>New Task</span>
      </Button>
    </div>
  );
}
