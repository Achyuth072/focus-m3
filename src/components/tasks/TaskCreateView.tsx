"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/lib/hooks/useHaptic";
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
import { ListChecks, Send, Inbox, Moon, CalendarClock } from "lucide-react";
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
  doDate: Date | undefined;
  setDoDate: (value: Date | undefined) => void;
  isEvening: boolean;
  setIsEvening: (value: boolean) => void;
  priority: 1 | 2 | 3 | 4;
  setPriority: (value: 1 | 2 | 3 | 4) => void;
  recurrence: RecurrenceRule | null;
  setRecurrence: (value: RecurrenceRule | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (value: string | null) => void;
  datePickerOpen: boolean;
  setDatePickerOpen: (value: boolean) => void;
  doDatePickerOpen: boolean;
  setDoDatePickerOpen: (value: boolean) => void;
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
  doDate,
  setDoDate,
  isEvening,
  setIsEvening,
  priority,
  setPriority,
  recurrence,
  setRecurrence,
  selectedProjectId,
  setSelectedProjectId,
  datePickerOpen,
  setDatePickerOpen,
  doDatePickerOpen,
  setDoDatePickerOpen,
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
  const { trigger } = useHaptic();

  return (
    <div className="flex flex-col h-full max-h-[90dvh] w-full overflow-hidden">
      <ResponsiveDialogHeader className="pb-4 shrink-0">
        <ResponsiveDialogTitle>New Task</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

      <div className="flex-1 overflow-y-auto px-4 sm:px-0 space-y-2 scrollbar-thin">
        {/* Task Name Input */}
        <Textarea
          autoFocus
          placeholder="Enter task name"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={onKeyDown}
          className="min-h-[80px] text-lg font-medium resize-none border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/70"
        />

        {/* Icon Row - Metadata Controls */}
        <div className="flex items-center gap-2 pt-2 pb-3 overflow-x-auto scrollbar-hide flex-wrap">
          <TaskDatePicker
            date={dueDate}
            setDate={setDueDate}
            isMobile={isMobile}
            open={datePickerOpen}
            onOpenChange={setDatePickerOpen}
            variant="icon"
            side="right"
            align="center"
            sideOffset={15}
          />

          <TaskDatePicker
            date={doDate}
            setDate={setDoDate}
            isMobile={isMobile}
            open={doDatePickerOpen}
            onOpenChange={setDoDatePickerOpen}
            variant="icon"
            title="Start Date"
            icon={CalendarClock}
            side="right"
            align="center"
            sideOffset={15}
            activeClassName="text-green-600 dark:text-green-400 border-green-500/50 bg-green-500/10"
          />

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-10 px-3 transition-all text-muted-foreground hover:text-foreground hover:bg-accent gap-1.5 shrink-0",
              isEvening && "text-purple-600 dark:text-purple-400 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20"
            )}
            onClick={() => {
              const nextValue = !isEvening;
              trigger(nextValue ? 35 : 25);
              setIsEvening(nextValue);
              if (nextValue && !doDate) {
                setDoDate(new Date());
              }
            }}
            title="This Evening"
          >
            <Moon strokeWidth={2} className="h-4 w-4" />
            {!isMobile && <span className="text-xs font-medium">Evening</span>}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              trigger(25);
              setShowSubtasks(!showSubtasks);
            }}
            className={cn(
              "h-10 w-10 p-0 transition-all text-muted-foreground hover:text-foreground hover:bg-accent group [&_svg]:!size-5 shrink-0",
              showSubtasks && "text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary"
            )}
            title="Toggle subtasks"
          >
            <ListChecks strokeWidth={2} className="transition-all" />
          </Button>

          <div className="shrink-0">
            <TaskPrioritySelect
              priority={priority}
              setPriority={setPriority}
              variant="icon"
            />
          </div>

          <div className="shrink-0">
            <RecurrencePicker
              value={recurrence}
              onChange={setRecurrence}
              variant="icon"
            />
          </div>
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
      <div className="shrink-0 flex items-center justify-between pt-4 border-t mt-3 px-4 sm:px-0 pb-[calc(0.5rem+env(safe-area-inset-bottom))] bg-background">
        <Select
          value={selectedProjectId || "inbox"}
          onValueChange={(v) => {
            trigger(20);
            setSelectedProjectId(v === "inbox" ? null : v);
          }}
        >
          <SelectTrigger 
            onPointerDown={() => trigger(15)}
            className="h-10 w-[140px] text-xs border border-transparent dark:border-white/10 bg-secondary/20 dark:bg-white/[0.05] hover:bg-secondary/30 focus:ring-0 transition-colors"
          >
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

        <Button
          size="sm"
          className="h-10 w-10 p-0 rounded-md [&_svg]:size-5"
          onClick={() => {
            trigger([10, 30]);
            onSubmit();
          }}
          disabled={!hasContent || isPending}
          title="Create task"
        >
          <Send className="stroke-[1.5px]" />
        </Button>
      </div>
    </div>
  );
}
