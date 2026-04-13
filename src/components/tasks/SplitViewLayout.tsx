"use client";

import { useState, useCallback } from "react";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { TaskDetailPanel } from "./TaskDetailPanel";
import TaskList from "./TaskList";
import type { Task } from "@/lib/types/task";
import type { SortOption, GroupOption } from "@/lib/types/sorting";

interface SplitViewLayoutProps {
  sortBy?: SortOption;
  groupBy?: GroupOption;
  projectId?: string;
  filter?: string;
}

export function SplitViewLayout({
  sortBy = "date",
  groupBy = "none",
  projectId,
  filter,
}: SplitViewLayoutProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { trigger } = useHaptic();

  const handleTaskSelect = useCallback(
    (task: Task) => {
      trigger("toggle"); // Toggle haptic for selection
      setSelectedTask(task);
    },
    [trigger],
  );

  const handleCloseDetail = useCallback(() => {
    trigger("tick"); // Tick haptic for close
    setSelectedTask(null);
  }, [trigger]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="w-[60%] h-full overflow-hidden">
        <TaskList
          sortBy={sortBy}
          groupBy={groupBy}
          projectId={projectId}
          filter={filter}
          onTaskSelect={handleTaskSelect}
        />
      </div>

      <div className="w-[40%] h-full border-l border-border/80 overflow-hidden bg-background">
        <TaskDetailPanel task={selectedTask} onClose={handleCloseDetail} />
      </div>
    </div>
  );
}
