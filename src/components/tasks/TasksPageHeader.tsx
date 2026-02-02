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

  useHotkeys("shift+1", () => onViewModeChange("grid"), {
    preventDefault: true,
  });
  useHotkeys("shift+2", () => isDesktop && onViewModeChange("board"), {
    preventDefault: true,
  });
  useHotkeys("shift+3", () => onViewModeChange("list"), {
    preventDefault: true,
  });

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-md border border-input h-8 overflow-hidden bg-muted/20">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-full w-8 p-0 rounded-none transition-all duration-200 border-r border-input/50 last:border-r-0",
            viewMode === "grid"
              ? "bg-background text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
          )}
          onClick={() => {
            trigger(15);
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
                ? "bg-background text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
            onClick={() => {
              trigger(15);
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
              ? "bg-background text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
          )}
          onClick={() => {
            trigger(15);
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
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onPointerDown={() => trigger(25)}
          >
            <ListFilter className="h-4 w-4" />
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
                onClick={() => trigger(15)}
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
                onClick={() => trigger(15)}
              >
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={openSheet}
        className="hidden md:flex items-center gap-2"
      >
        <CheckCircle2 className="h-4 w-4" />
        Completed
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onNewTask}
        className="hidden md:flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        New Task
      </Button>
    </div>
  );
}
