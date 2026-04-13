"use client";

import React, { useMemo, memo, useState, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import type { Task, Project } from "@/lib/types/task";
import type { ProcessedTasks } from "@/lib/hooks/useTaskViewData";
import { cn } from "@/lib/utils";

import { Masonry } from "@/components/ui/Masonry";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useToggleTask } from "@/lib/hooks/useTaskMutations";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { Check, Play } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { priorityCheckboxClasses } from "./task-utils";
import { useRouter } from "next/navigation";
import { useTimer } from "@/components/TimerProvider";
import { KanbanBoardCardButton } from "@/components/kanban";

interface TaskMasonryGridProps {
  processedTasks: ProcessedTasks;
  projects?: Project[];
  onSelect?: (task: Task) => void;
}

export function TaskMasonryGrid({
  processedTasks,
  projects,
  onSelect,
}: TaskMasonryGridProps) {
  const { active, evening, groups } = processedTasks;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Flatten keeping the processed order (groups or flat)
  const allNavigableTasks = useMemo(() => {
    const list: Task[] = [];
    if (groups) {
      groups.forEach((g) => list.push(...g.tasks));
    } else {
      list.push(...active);
      // Add evening tasks at the end of the active set ONLY if not grouped (where they are included)
      list.push(...evening);
    }
    return list;
  }, [active, evening, groups]);

  if (allNavigableTasks.length === 0) {
    return (
      <div className="px-4 md:px-6 py-12 text-center text-muted-foreground">
        No active tasks to display in grid.
      </div>
    );
  }

  // Use "16px" (gap=4) for mobile, larger gap (gap=6) for desktop grid masonry
  const gap = isDesktop ? 6 : 4;

  return (
    <div className="px-4 md:px-6 pb-12 md:pb-8">
      <Masonry
        gap={gap}
        items={allNavigableTasks}
        renderItem={(task) => (
          <TaskCard
            key={task.id}
            task={task}
            projects={projects}
            onSelect={onSelect}
            isDesktop={isDesktop}
          />
        )}
      />
    </div>
  );
}

const SWIPE_THRESHOLD = 150; // Threshold for mobile horizontal swipe

const TaskCard = memo(function TaskCard({
  task,
  projects,
  onSelect,
  isDesktop,
}: {
  task: Task;
  projects?: Project[];
  onSelect?: (task: Task) => void;
  isDesktop: boolean;
}) {
  const [isCompleting, setIsCompleting] = useState(false);
  const toggleMutation = useToggleTask();
  const { trigger } = useHaptic();
  const x = useMotionValue(0);
  const router = useRouter();
  const { start } = useTimer();

  const projectName = useMemo(() => {
    if (!task.project_id) return null;
    if (task.project_id === "inbox") return "Inbox";
    const project = projects?.find((p) => p.id === task.project_id);
    return project?.name || task.project_id;
  }, [task.project_id, projects]);

  const handleComplete = useCallback(() => {
    if (isCompleting) return;
    setIsCompleting(true);

    // Delayed mutation to allow the physics animation to finish
    setTimeout(() => {
      toggleMutation.mutate({ id: task.id, is_completed: true });
    }, 250); // Small delay to let the animation play
  }, [isCompleting, task.id, toggleMutation]);

  const handlePlayFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    trigger("thud");
    start(task.id);
    router.push("/focus");
  };

  const handleDesktopComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    trigger("success");
    handleComplete();
  };

  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x > SWIPE_THRESHOLD && !isCompleting) {
      trigger("success");
      handleComplete();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      trigger("thud");
      start(task.id);
      router.push("/focus");
    }
  };

  const lastTickRef = useRef(0);
  const handleDrag = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const currentX = info.offset.x;
    // Tick (10ms) haptic during drag for physical tension
    if (
      Math.abs(currentX) > Math.abs(lastTickRef.current) + 30 &&
      Math.abs(currentX) < SWIPE_THRESHOLD
    ) {
      trigger("tick");
      lastTickRef.current = currentX;
    } else if (Math.abs(currentX) < Math.abs(lastTickRef.current) - 30) {
      lastTickRef.current = currentX;
    }
  };

  const handleDragStart = () => {
    lastTickRef.current = 0;
  };

  const completeBgOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const playBgOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const completeIconScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.5, 1]);
  const playIconScale = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0.5]);

  const completeIconOpacity = useTransform(
    x,
    [SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
    [0, 1],
  );
  const playIconOpacity = useTransform(
    x,
    [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2],
    [1, 0],
  );

  return (
    <AnimatePresence>
      {!isCompleting && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            type: "spring",
            mass: 1,
            stiffness: 280,
            damping: 60,
          }}
          className={cn(
            "group relative bg-background border border-border rounded-xl overflow-hidden cursor-pointer",
            isDesktop &&
              "hover:border-foreground/20 hover:bg-secondary/5 transition-seijaku",
          )}
          onClick={() => onSelect?.(task)}
        >
          {isDesktop ? (
            // Desktop View: Hover Stamp
            <div className="flex flex-col gap-3 p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-0.5 flex-1 min-w-0">
                  <h4
                    className={cn(
                      "text-[15px] font-medium leading-relaxed transition-colors",
                      task.is_completed && "line-through text-muted-foreground",
                    )}
                  >
                    {task.content}
                  </h4>
                </div>
                <div className="flex items-center h-7 gap-1 opacity-0 group-hover:opacity-100 transition-seijaku-fast">
                  <KanbanBoardCardButton
                    onClick={handlePlayFocus}
                    className="h-7 w-7 text-muted-foreground/40 hover:text-brand-foreground hover:bg-brand hover:shadow-brand/10 border-none transition-seijaku"
                    tooltip="Start focus timer"
                  >
                    <Play
                      className="h-3.5 w-3.5 fill-current"
                      strokeWidth={2.25}
                    />
                  </KanbanBoardCardButton>

                  <div
                    className="h-7 w-7 flex items-center justify-center -mr-1"
                    onClick={handleDesktopComplete}
                  >
                    <Checkbox
                      checked={isCompleting}
                      className={cn(
                        priorityCheckboxClasses[task.priority as 1 | 2 | 3 | 4],
                        "h-4 w-4 !rounded-sm pointer-events-none",
                      )}
                    />
                  </div>
                </div>
              </div>

              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {task.description}
                </p>
              )}

              <div className="flex items-center gap-3 flex-wrap min-h-4">
                {task.is_evening && (
                  <span className="text-[11px] text-foreground font-semibold uppercase tracking-wider leading-none">
                    Evening
                  </span>
                )}
                {projectName && (
                  <span className="text-[11px] text-foreground/60 uppercase tracking-widest font-semibold leading-none">
                    #{projectName}
                  </span>
                )}
              </div>
            </div>
          ) : (
            // Mobile View: Tactile Swipe (Bi-directional)
            <div className="relative">
              {/* Underlying Swipe Background (Complete - Right) */}
              <motion.div
                className="absolute inset-0 bg-brand flex items-center pl-6"
                style={{ opacity: completeBgOpacity }}
              >
                <motion.div
                  style={{
                    scale: completeIconScale,
                    opacity: completeIconOpacity,
                  }}
                >
                  <Check className="text-white h-7 w-7" strokeWidth={2.25} />
                </motion.div>
              </motion.div>

              {/* Underlying Swipe Background (Play - Left) */}
              <motion.div
                className="absolute inset-0 bg-zinc-800 flex items-center justify-end pr-6"
                style={{ opacity: playBgOpacity }}
              >
                <motion.div
                  style={{ scale: playIconScale, opacity: playIconOpacity }}
                >
                  <Play
                    className="text-white h-7 w-7 fill-current"
                    strokeWidth={2.25}
                  />
                </motion.div>
              </motion.div>

              {/* Draggable Foreground Card */}
              <motion.div
                className="flex flex-col gap-3 p-6 bg-background relative z-10 h-full"
                style={{ x }}
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.8, right: 0.8 }}
                dragMomentum={false}
                dragSnapToOrigin={true}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-0.5 flex-1 min-w-0">
                    <h4
                      className={cn(
                        "text-[15px] font-medium leading-relaxed transition-colors",
                        task.is_completed &&
                          "line-through text-muted-foreground",
                      )}
                    >
                      {task.content}
                    </h4>
                  </div>
                </div>

                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-3 flex-wrap min-h-4">
                  {task.is_evening && (
                    <span className="text-[11px] text-foreground font-semibold uppercase tracking-wider leading-none">
                      Evening
                    </span>
                  )}
                  {projectName && (
                    <span className="text-[11px] text-foreground/60 uppercase tracking-widest font-semibold leading-none">
                      #{projectName}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
