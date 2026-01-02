"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListChecks, Send, FolderKanban, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import SubtaskList from "./SubtaskList";
import { TaskDatePicker } from "./shared/TaskDatePicker";
import { TaskPrioritySelect } from "./shared/TaskPrioritySelect";
import RecurrencePicker from "./TaskSheet/RecurrencePicker";
import type { Project } from "@/lib/types/task";
import type { RecurrenceRule } from "@/lib/utils/recurrence";

interface TaskCreateViewProps {
  content: string;
  setContent: (value: string) => void;
  dueDate: Date | undefined;
  setDueDate: (value: Date | undefined) => void;
  priority: 1 | 2 | 3 | 4;
  setPriority: (value: 1 | 2 | 3 | 4) => void;
  recurrence: RecurrenceRule | null;
  setRecurrence: (value: RecurrenceRule | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (value: string | null) => void;
  datePickerOpen: boolean;
  setDatePickerOpen: (value: boolean) => void;
  showSubtasks: boolean;
  setShowSubtasks: (value: boolean) => void;
  draftSubtasks: string[];
  setDraftSubtasks: (value: string[]) => void;
  inboxProjectId: string | null;
  projects: Project[] | undefined;
  isMobile: boolean;
  hasContent: boolean;
  isPending: boolean;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function TaskCreateView({
  content,
  setContent,
  dueDate,
  setDueDate,
  priority,
  setPriority,
  recurrence,
  setRecurrence,
  selectedProjectId,
  setSelectedProjectId,
  datePickerOpen,
  setDatePickerOpen,
  showSubtasks,
  setShowSubtasks,
  draftSubtasks,
  setDraftSubtasks,
  inboxProjectId,
  projects,
  isMobile,
  hasContent,
  isPending,
  onSubmit,
  onKeyDown,
}: TaskCreateViewProps) {
  return (
    <>
      <ResponsiveDialogHeader className="pb-4">
        <ResponsiveDialogTitle>New Task</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

      <div className="px-4 sm:px-0">
        {/* Task Name Input */}
        <Textarea
          autoFocus
          placeholder="Enter task name"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={onKeyDown}
          className="min-h-[60px] text-lg font-medium resize-none border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/70"
        />

        {/* Icon Row - Metadata Controls */}
        <div className="flex items-center gap-3 pt-4 pb-3">
          {/* Date Picker */}
          <TaskDatePicker
            date={dueDate}
            setDate={setDueDate}
            isMobile={isMobile}
            open={datePickerOpen}
            onOpenChange={setDatePickerOpen}
            variant="icon"
          />

          {/* Subtask Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSubtasks(!showSubtasks)}
            className={cn(
              "h-10 w-10 p-0 transition-all text-muted-foreground hover:text-foreground shadow-sm dark:bg-white/[0.03] dark:border dark:border-white/10 group [&_svg]:!size-5",
              showSubtasks && "text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary"
            )}
            title="Toggle subtasks"
          >
            <ListChecks strokeWidth={2} className="transition-all" />
          </Button>

          {/* Priority Selector */}
          <TaskPrioritySelect
            priority={priority}
            setPriority={setPriority}
            variant="icon"
          />

          {/* Recurrence Picker */}
          <RecurrencePicker
            value={recurrence}
            onChange={setRecurrence}
            variant="icon"
          />
        </div>

        {/* Subtasks Section - Collapsible */}
        {showSubtasks && (
          <div className="pt-2 pb-2 border-t">
            <SubtaskList
              taskId={undefined}
              projectId={inboxProjectId}
              draftSubtasks={draftSubtasks}
              onDraftSubtasksChange={setDraftSubtasks}
            />
          </div>
        )}
      </div>

      {/* Footer Row - Project & Send */}
      <div className="flex items-center justify-between pt-4 border-t mt-3 px-4 sm:px-0 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {/* Project Selector */}
        <Select
          value={selectedProjectId || "inbox"}
          onValueChange={(v) => setSelectedProjectId(v === "inbox" ? null : v)}
        >
          <SelectTrigger className="h-10 w-[140px] text-xs border border-transparent dark:border-white/10 bg-secondary/20 dark:bg-white/[0.05] hover:bg-secondary/30 focus:ring-0 transition-colors">
            <SelectValue placeholder="Inbox" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inbox">
              <div className="flex items-center gap-2">
                <Inbox strokeWidth={2} className="h-3 w-3" />
                <span>Inbox</span>
              </div>
            </SelectItem>
            {projects
              ?.filter((p) => !p.is_inbox)
              .map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Send Button */}
        <Button
          size="sm"
          className="h-10 w-10 p-0 rounded-md [&_svg]:size-5"
          onClick={onSubmit}
          disabled={!hasContent || isPending}
          title="Create task"
        >
          <Send className="stroke-[1.5px]" />
        </Button>
      </div>
    </>
  );
}
