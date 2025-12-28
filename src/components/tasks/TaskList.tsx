'use client';

import { useState, useMemo } from 'react';
import { useTasks } from '@/lib/hooks/useTasks';
import TaskItem from './TaskItem';
import TaskSheet from './TaskSheet';
import type { Task } from '@/lib/types/task';
import { SortOption, GroupOption } from '@/lib/types/sorting';
import { compareAsc, parseISO, isBefore, isToday, isTomorrow, startOfDay, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskListProps {
  sortBy?: SortOption;
  groupBy?: GroupOption;
}

export default function TaskList({ sortBy = 'date', groupBy = 'none' }: TaskListProps) {
  const { data: tasks, isLoading } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const processedTasks = useMemo(() => {
    if (!tasks) return { active: [], completed: [] };

    const active = tasks.filter((t) => !t.is_completed);
    const completed = tasks.filter((t) => t.is_completed);

    // Sorting Helper
    const sortFn = (a: Task, b: Task) => {
      if (sortBy === 'priority') {
        const diff = a.priority - b.priority;
        if (diff !== 0) return diff;
      }
      if (sortBy === 'date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        const diff = compareAsc(parseISO(a.due_date), parseISO(b.due_date));
        if (diff !== 0) return diff;
      }
      if (sortBy === 'alphabetical') {
        return a.content.localeCompare(b.content);
      }
      // Default: Date if not already sorted
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return compareAsc(parseISO(a.due_date), parseISO(b.due_date));
    };

    active.sort(sortFn);

    // Grouping
    if (groupBy === 'none') {
      return { active, completed, groups: null };
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
        if (!task.due_date) {
          groups['No Date'].push(task);
          return;
        }
        const date = parseISO(task.due_date);
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

    return { active, completed, groups: finalGroups };

  }, [tasks, sortBy, groupBy]);

  if (isLoading) {
    return (
      <div className="px-6 py-4">
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const { active, completed, groups } = processedTasks;

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
      <div className="px-4 md:px-6 space-y-4">
        {/* Active Tasks Grouped */}
        {groups ? (
          groups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground px-1">{group.title}</h3>
              {group.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          ))
        ) : (
          // Active Tasks Flat
          <div className="space-y-2">
             {active.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
              />
            ))}
          </div>
        )}

        {/* Completed Section */}
        {completed.length > 0 && (
          <div className="pt-4">
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
              Completed ({completed.length})
            </p>
            <div className="space-y-2 opacity-60">
              {completed.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Sheet */}
      <TaskSheet
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        initialTask={selectedTask}
      />
    </>
  );
}
