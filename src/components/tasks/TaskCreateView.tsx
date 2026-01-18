"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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

import { FieldErrors } from "react-hook-form";
import type { CreateTaskInput } from "@/lib/schemas/task";

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
  errors?: FieldErrors<CreateTaskInput>;
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
  errors,
}: TaskCreateViewProps) {
  const { trigger } = useHaptic();

  return (
    <div className="flex flex-col h-auto max-h-[90dvh] w-full max-w-full overflow-hidden">
      <ResponsiveDialogHeader className="pb-6 shrink-0 px-6 sm:px-0">
        <ResponsiveDialogTitle className="type-h2">
          New Task
        </ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

      <div className="flex-1 min-h-0 px-6 sm:px-0 space-y-8 w-full">
        {/* Task Name Input */}
        <div>
          <Label htmlFor="task-content" className="sr-only">
            Task Content
          </Label>
          <Textarea
            id="task-content"
            placeholder="What needs to be done?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            className={cn(
              "text-xl sm:text-2xl font-semibold p-0 min-h-[40px] h-auto bg-transparent border-0 focus-visible:ring-0 resize-none placeholder:text-muted-foreground/40 tracking-tight leading-tight",
              errors?.content &&
                "text-destructive placeholder:text-destructive/50",
            )}
            aria-invalid={!!errors?.content}
            aria-describedby={
              errors?.content ? "task-content-error" : undefined
            }
          />
          {errors?.content && (
            <p
              id="task-content-error"
              className="text-xs font-medium text-destructive mt-1"
            >
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Icon Row - Metadata Controls */}
        <div className="flex items-center gap-3 pt-2 pb-4 overflow-x-auto scrollbar-hide flex-wrap">
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
            title={!isMobile ? "Start Date" : undefined}
            icon={CalendarClock}
            side="right"
            align="center"
            sideOffset={15}
          />

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-10 px-4 transition-all text-muted-foreground hover:text-foreground hover:bg-accent gap-2 shrink-0 rounded-lg border-border/50",
              isEvening &&
                "text-brand bg-brand/10 border-brand/20 hover:bg-brand/20",
            )}
            onClick={() => {
              const nextValue = !isEvening;
              trigger(15);
              setIsEvening(nextValue);
              if (nextValue && !doDate) {
                setDoDate(new Date());
              }
            }}
            title={!isMobile ? "This Evening" : undefined}
            aria-label="This Evening"
          >
            <Moon strokeWidth={2.25} className="h-4 w-4" />
            {!isMobile && <span className="type-ui">Evening</span>}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              trigger(15);
              setShowSubtasks(!showSubtasks);
            }}
            className={cn(
              "h-10 w-10 p-0 transition-all text-muted-foreground hover:text-foreground hover:bg-accent group [&_svg]:!size-5 shrink-0 rounded-lg border-border/50",
              showSubtasks &&
                "text-brand bg-brand/10 border-brand/20 hover:bg-brand/20 hover:text-brand",
            )}
            title={!isMobile ? "Toggle subtasks" : undefined}
            aria-label="Toggle subtasks"
          >
            <ListChecks strokeWidth={2.25} className="transition-all" />
          </Button>

          <div className="shrink-0">
            <TaskPrioritySelect
              priority={priority}
              setPriority={setPriority}
              variant="icon"
              isMobile={isMobile}
            />
          </div>

          <div className="shrink-0">
            <RecurrencePicker
              value={recurrence}
              onChange={setRecurrence}
              variant="icon"
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* Subtasks Section - Collapsible */}
        {showSubtasks && (
          <div className="pt-2 pb-2">
            <div className="mb-4">
              <span className="type-ui text-muted-foreground/70 uppercase tracking-widest font-bold">
                Subtasks
              </span>
            </div>
            <div className="pl-1">
              <SubtaskList
                taskId={undefined}
                projectId={inboxProjectId}
                draftSubtasks={draftSubtasks}
                onDraftSubtasksChange={setDraftSubtasks}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Row - Project & Send */}
      <div className="shrink-0 flex items-center justify-between pt-6 border-t border-border/40 mt-6 px-6 sm:px-0 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background">
        <Select
          value={selectedProjectId || "inbox"}
          onValueChange={(v) => {
            trigger(15);
            setSelectedProjectId(v === "inbox" ? null : v);
          }}
        >
          <SelectTrigger
            onPointerDown={() => trigger(15)}
            className="h-10 w-[140px] type-ui border-border/50 bg-secondary/10 hover:bg-secondary/20 focus:ring-0 transition-colors rounded-lg"
          >
            <SelectValue placeholder="Inbox" />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-border/80 shadow-2xl">
            <SelectItem value="inbox">
              <div className="flex items-center gap-2">
                <Inbox strokeWidth={2.25} className="h-4 w-4" />
                <span className="font-medium">Inbox</span>
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
                    <span className="truncate font-medium">{project.name}</span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          className="h-10 w-10 p-0 rounded-lg [&_svg]:size-5 bg-brand hover:bg-brand/90 text-brand-foreground shadow-lg shadow-brand/10 transition-seijaku"
          onClick={() => {
            trigger([10, 50]);
            onSubmit();
          }}
          disabled={!hasContent || isPending}
          title={!isMobile ? "Create task" : undefined}
          aria-label="Create task"
        >
          <Send className="stroke-[2.25px]" />
        </Button>
      </div>
    </div>
  );
}
