'use client';
/* eslint-disable react-hooks/set-state-in-effect */

  import { useState, useMemo, useRef, useEffect, useCallback } from 'react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTasks } from '@/lib/hooks/useTasks';
import TaskItem from './TaskItem';
import SortableTaskItem from './SortableTaskItem';
import TaskSheet from './TaskSheet';
import type { Task } from '@/lib/types/task';
import { SortOption, GroupOption } from '@/lib/types/sorting';
import { compareAsc, parseISO, isBefore, isToday, isTomorrow, startOfDay } from 'date-fns';
import { useReorderTasks, useDeleteTask, useToggleTask } from '@/lib/hooks/useTaskMutations';
import { useUiStore } from '@/lib/store/uiStore';
import { useHaptic } from '@/lib/hooks/useHaptic';
import { useHotkeys } from 'react-hotkeys-hook';

interface TaskListProps {
  sortBy?: SortOption;
  groupBy?: GroupOption;
  projectId?: string | null;
  filter?: string;
}

export default function TaskList({ sortBy = 'date', groupBy = 'none', projectId, filter }: TaskListProps) {
  const { data: tasks, isLoading } = useTasks({ projectId, filter });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [keyboardSelectedId, setKeyboardSelectedId] = useState<string | null>(null);
  
  const reorderMutation = useReorderTasks();
  const deleteMutation = useDeleteTask();
  const toggleMutation = useToggleTask();
  const { setSortBy } = useUiStore();
  const { trigger } = useHaptic();
  const justDragged = useRef(false);

  // Configure sensors with activation constraints to avoid conflicts with swipe
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms hold required on touch devices
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const processedTasks = useMemo(() => {
    if (!tasks) return { active: [], completed: [], evening: [] };

    const completed = tasks.filter((t) => t.is_completed);
    
    // Separate "This Evening" tasks from regular active tasks
    const allActive = tasks.filter((t) => !t.is_completed);
    const evening = allActive.filter((t) => t.is_evening);
    const active = allActive.filter((t) => !t.is_evening);

    // Sorting Helper
    const sortFn = (a: Task, b: Task) => {
      // Custom: preserve original order (day_order from DB query)
      if (sortBy === 'custom') return 0;

      if (sortBy === 'priority') {
        const diff = a.priority - b.priority;
        if (diff !== 0) return diff;
      }
      if (sortBy === 'date') {
        // Prioritize do_date (when to start) over due_date (deadline)
        const aDate = a.do_date || a.due_date;
        const bDate = b.do_date || b.due_date;
        
        if (!aDate) return 1;
        if (!bDate) return -1;
        const diff = compareAsc(parseISO(aDate), parseISO(bDate));
        if (diff !== 0) return diff;
      }
      if (sortBy === 'alphabetical') {
        return a.content.localeCompare(b.content);
      }
      // Default: Date if not already sorted
      const aDate = a.do_date || a.due_date;
      const bDate = b.do_date || b.due_date;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return compareAsc(parseISO(aDate), parseISO(bDate));
    };

    active.sort(sortFn);
    evening.sort(sortFn);

    // Grouping
    if (groupBy === 'none') {
      return { active, completed, evening, groups: null };
    }

    const groups: Record<string, Task[]> = {};
    const groupOrder: string[] = [];

    if (groupBy === 'priority') {
      const labels: Record<number, string> = { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low' };
      [1, 2, 3, 4].forEach((p) => {
        const key = labels[p as 1|2|3|4];
        groups[key] = [];
        groupOrder.push(key);
      });
      
      active.forEach((task) => {
        const key = labels[task.priority];
        groups[key].push(task);
      });
    } else if (groupBy === 'date') {
      const today = startOfDay(new Date());
      groupOrder.push('Overdue', 'Today', 'Tomorrow', 'Upcoming', 'No Date');
      groupOrder.forEach(k => groups[k] = []);

      active.forEach((task) => {
        // Use do_date (start date) if available, otherwise fall back to due_date
        const taskDate = task.do_date || task.due_date;
        
        if (!taskDate) {
          groups['No Date'].push(task);
          return;
        }
        const date = parseISO(taskDate);
        if (isBefore(date, today)) groups['Overdue'].push(task);
        else if (isToday(date)) groups['Today'].push(task);
        else if (isTomorrow(date)) groups['Tomorrow'].push(task);
        else groups['Upcoming'].push(task);
      });
    }

    // Clean up empty groups
    const finalGroups = groupOrder
      .filter(key => groups[key].length > 0)
      .map(key => ({ title: key, tasks: groups[key] }));

    return { active, completed, evening, groups: finalGroups };

  }, [tasks, sortBy, groupBy]);

  // Sync local tasks with processed tasks (skip if just dragged)
  useEffect(() => {
    if (justDragged.current) {
      justDragged.current = false;
      return; // Skip sync - keep optimistic order
    }
    setLocalTasks(processedTasks.active);
  }, [processedTasks.active]);
  
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const handleDragStart = () => {
    trigger(50);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = localTasks.findIndex((task) => task.id === active.id);
    const newIndex = localTasks.findIndex((task) => task.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Haptic feedback on successful drop
    trigger(30);

    // Mark as just dragged to skip sync overwrite
    justDragged.current = true;

    // Auto-switch to custom sort if not already
    if (sortBy !== 'custom') {
      setSortBy('custom');
    }

    // Optimistic update
    const reordered = arrayMove(localTasks, oldIndex, newIndex);
    setLocalTasks(reordered);

    // Persist to database - update ALL tasks in the collection to ensure correct day_order
    reorderMutation.mutate(reordered.map((t) => t.id));
  };


  // --- Keyboard Navigation ---

  const navigableTasks = useMemo(() => {
    const list: Task[] = [];
    if (processedTasks.groups) {
      processedTasks.groups.forEach(g => list.push(...g.tasks));
    } else {
      list.push(...localTasks);
    }
    // Add evening
    list.push(...processedTasks.evening);
    // Add completed
    list.push(...processedTasks.completed);
    return list;
  }, [processedTasks, localTasks]);

  const handleNav = (direction: 1 | -1) => {
    if (navigableTasks.length === 0) return;
    
    const currentIndex = navigableTasks.findIndex(t => t.id === keyboardSelectedId);
    if (currentIndex === -1) {
      // Select first if nothing selected
      setKeyboardSelectedId(navigableTasks[0].id);
      return;
    }

    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < navigableTasks.length) {
      setKeyboardSelectedId(navigableTasks[nextIndex].id);
      
      // Scroll into view logic could go here if needed, 
      // but native focus handling often easier if we actually focused the element.
      // For now, visual highlight only.
    }
  };

  useHotkeys('j', () => handleNav(1), { preventDefault: true });
  useHotkeys('k', () => handleNav(-1), { preventDefault: true });
  
  useHotkeys('space', (e) => {
    e.preventDefault(); // Prevent scrolling
    if (keyboardSelectedId) {
      const task = navigableTasks.find(t => t.id === keyboardSelectedId);
      if (task) {
        toggleMutation.mutate({ id: task.id, is_completed: !task.is_completed });
      }
    }
  });

  useHotkeys(['enter', 'e'], () => {
    if (keyboardSelectedId) {
      const task = navigableTasks.find(t => t.id === keyboardSelectedId);
      if (task) setSelectedTask(task);
    }
  }, { preventDefault: true });

  useHotkeys(['d', 'backspace'], () => {
    if (keyboardSelectedId) {
       // Optional: Add confirmation or simply visually strike through?
       // For safety, let's just trigger delete mutation
       deleteMutation.mutate(keyboardSelectedId);
       // Select next task automatically
       handleNav(1); 
    }
  });

  if (isLoading) {
    return (
      <div className="px-4 md:px-6 py-4">
        <div className="space-y-0">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 md:h-8 md:border-b md:border-border/40 rounded-xl md:rounded-sm mx-2 md:mx-0 mb-2 md:mb-0 bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const { active, completed, evening, groups } = processedTasks;

  if (active.length === 0 && completed.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-muted-foreground">
          No tasks yet. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="px-4 md:px-6 space-y-4">
          {/* Active Tasks Grouped */}
          {groups ? (
            groups.map((group) => (
              <div key={group.title} className="space-y-0 md:space-y-0.5">
                <h3 className="text-sm font-semibold text-muted-foreground px-1">{group.title}</h3>
                {group.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onSelect={handleTaskClick}
                    isKeyboardSelected={task.id === keyboardSelectedId}
                  />
                ))}
              </div>
            ))
          ) : (
            // Active Tasks Flat - with Drag & Drop
            <SortableContext
              items={localTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0 md:space-y-0.5">
                {localTasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onSelect={handleTaskClick}
                    isKeyboardSelected={task.id === keyboardSelectedId}
                  />
                ))}
              </div>
            </SortableContext>
          )}

          {/* This Evening Section */}
          {evening.length > 0 && (
            <div className="pt-4">
              <p className="text-xs font-medium text-muted-foreground px-1 mb-2 flex items-center gap-1.5">
                <span className="text-sm">🌙</span>
                This Evening ({evening.length})
              </p>
              <div className="space-y-0 md:space-y-0.5">
                {evening.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onSelect={handleTaskClick}
                    isKeyboardSelected={task.id === keyboardSelectedId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {completed.length > 0 && (
            <div className="pt-4">
              <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
                Completed ({completed.length})
              </p>
              <div className="space-y-0 md:space-y-0.5 opacity-60">
                {completed.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onSelect={handleTaskClick}
                    isKeyboardSelected={task.id === keyboardSelectedId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DndContext>

      {/* Edit Sheet */}
      <TaskSheet
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        initialTask={selectedTask}
      />
    </>
  );
}
