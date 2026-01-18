"use client";

import { useState, useCallback } from "react";
import { useHaptic } from "@/lib/hooks/useHaptic";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
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
      trigger(15); // Toggle haptic for selection
      setSelectedTask(task);
    },
    [trigger],
  );

  const handleCloseDetail = useCallback(() => {
    trigger(10); // Tick haptic for close
    setSelectedTask(null);
  }, [trigger]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full gap-0"
      style={{ transitionTimingFunction: "var(--ease-seijaku)" }}
    >
      <ResizablePanel defaultSize="60%" minSize="40%">
        <TaskList
          sortBy={sortBy}
          groupBy={groupBy}
          projectId={projectId}
          filter={filter}
          onTaskSelect={handleTaskSelect}
        />
      </ResizablePanel>

      <ResizableHandle className="relative w-0 after:!inset-y-auto after:!top-1/2 after:!-translate-y-1/2 after:!h-8 after:absolute after:left-0 after:-translate-x-1/2 after:w-1 after:rounded-full after:cursor-col-resize after:transition-all after:duration-300 after:bg-transparent hover:after:!bg-border/60 active:after:!bg-primary/40" />

      <ResizablePanel
        defaultSize="40%"
        minSize="25%"
        maxSize="50%"
        collapsible
        collapsedSize={0}
        onResize={(size) => {
          if ((size as unknown as number) === 0 && selectedTask) {
            setSelectedTask(null);
          }
        }}
        className="border-l border-border/80 transition-all duration-300"
      >
        <TaskDetailPanel task={selectedTask} onClose={handleCloseDetail} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
