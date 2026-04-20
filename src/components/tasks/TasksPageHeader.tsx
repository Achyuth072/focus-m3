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

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="flex items-center gap-3">
      <SyncIndicator />

      <Tabs
        value={viewMode}
        onValueChange={(v) => {
          trigger("toggle");
          onViewModeChange(v as "list" | "grid" | "board");
        }}
        className="h-10"
      >
        <TabsList className="bg-secondary/10 p-1 rounded-lg h-10 border border-border/40 shadow-none">
          <TabsTrigger
            value="list"
            className="rounded-md gap-2 px-2.5 text-[13px] font-medium tracking-tight data-[state=active]:bg-brand data-[state=active]:text-brand-foreground data-[state=active]:shadow-none transition-all h-8 border border-transparent data-[state=active]:border-brand/20"
            title="List View (Shift+1)"
          >
            <List className="h-4 w-4" strokeWidth={2.25} />
            <span className="hidden md:inline">List</span>
          </TabsTrigger>
          {isDesktop && (
            <TabsTrigger
              value="board"
              className="rounded-md gap-2 px-2.5 text-[13px] font-medium tracking-tight data-[state=active]:bg-brand data-[state=active]:text-brand-foreground data-[state=active]:shadow-none transition-all h-8 border border-transparent data-[state=active]:border-brand/20"
              title="Board View (Shift+2)"
            >
              <KanbanSquare className="h-4 w-4" strokeWidth={2.25} />
              <span className="hidden md:inline">Board</span>
            </TabsTrigger>
          )}
          <TabsTrigger
            value="grid"
            className="rounded-md gap-2 px-2.5 text-[13px] font-medium tracking-tight data-[state=active]:bg-brand data-[state=active]:text-brand-foreground data-[state=active]:shadow-none transition-all h-8 border border-transparent data-[state=active]:border-brand/20"
            title="Grid View (Shift+3)"
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={2.25} />
            <span className="hidden md:inline">Grid</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 w-9 p-0 relative bg-secondary hover:bg-secondary/80 border border-border",
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
        className="hidden md:flex h-9 items-center gap-2 bg-secondary hover:bg-secondary/80 border border-border px-3 text-[13px] font-medium"
      >
        <CheckCircle2
          className="h-4 w-4 text-foreground/70"
          strokeWidth={2.25}
        />
        <span>Completed</span>
      </Button>

      <Button
        size="sm"
        onClick={onNewTask}
        className="hidden md:flex h-9 items-center gap-2 rounded-lg bg-brand text-brand-foreground hover:bg-brand/90 border-none shadow-sm shadow-brand/10 transition-seijaku shrink-0 px-4 text-[13px] font-semibold"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        <span>New Task</span>
      </Button>
    </div>
  );
}
