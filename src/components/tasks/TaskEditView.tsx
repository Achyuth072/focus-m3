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
import {
  ListChecks,
  Save,
  Trash2,
  Inbox,
  Moon,
  CalendarClock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useHorizontalScroll } from "@/lib/hooks/useHorizontalScroll";
import SubtaskList from "./SubtaskList";
import { TaskDatePicker } from "./shared/TaskDatePicker";
import { TaskPrioritySelect } from "./shared/TaskPrioritySelect";
import RecurrencePicker from "./TaskSheet/RecurrencePicker";
import type { Task, Project } from "@/lib/types/task";
import type { RecurrenceRule } from "@/lib/utils/recurrence";

import { FieldErrors } from "react-hook-form";
import type { CreateTaskInput } from "@/lib/schemas/task";

interface TaskEditViewProps {
  initialTask: Task;
  content: string;
  setContent: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (value: boolean) => void;
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
  onDelete: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  errors?: FieldErrors<CreateTaskInput>;
  hideDialogHeader?: boolean;
}

export function TaskEditView({
  initialTask,
  content,
  setContent,
  description,
  setDescription,
  isPreviewMode,
  setIsPreviewMode,
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
  onDelete,
  onKeyDown,
  errors,
  hideDialogHeader = false,
}: TaskEditViewProps) {
  const scrollRef = useHorizontalScroll();
  const { trigger } = useHaptic();

  return (
    <div className="flex flex-col h-auto max-h-[90dvh] w-full max-w-full overflow-hidden">
      {!hideDialogHeader && (
        <ResponsiveDialogHeader className="pb-4 shrink-0">
          <ResponsiveDialogTitle>Edit Task</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
      )}

      {/* Scrollable Content Area */}
      <div
        className={cn(
          "flex-1 min-h-0 w-full",
          hideDialogHeader
            ? "px-8 py-8 md:px-12 md:py-12 space-y-10"
            : "px-4 sm:pl-0 sm:pr-4 space-y-6",
        )}
      >
        {/* Content Input */}
        <div>
          <Label htmlFor="task-content-edit" className="sr-only">
            Task Content
          </Label>
          <Textarea
            id="task-content-edit"
            placeholder="What needs to be done?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={onKeyDown}
            className={cn(
              "text-xl sm:text-2xl font-semibold p-0 min-h-[40px] h-auto bg-transparent border-0 focus-visible:ring-0 resize-none placeholder:text-muted-foreground/40 tracking-tight leading-tight",
              errors?.content &&
                "text-destructive placeholder:text-destructive/50",
            )}
            aria-invalid={!!errors?.content}
            aria-describedby={
              errors?.content ? "task-content-edit-error" : undefined
            }
          />
          {errors?.content && (
            <p
              id="task-content-edit-error"
              className="text-xs font-medium text-destructive mt-1"
            >
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Description Input (Markdown) */}
        <div className="pt-2">
          <div className="flex items-center justify-between pb-3">
            <span className="type-ui text-muted-foreground/70 uppercase tracking-widest font-bold">
              Description
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors rounded-lg border-border/40"
              onClick={() => {
                trigger(15);
                setIsPreviewMode(!isPreviewMode);
              }}
              disabled={!description.trim() && !isPreviewMode}
            >
              {isPreviewMode ? "Edit" : "Preview"}
            </Button>
          </div>

          {isPreviewMode ? (
            <div className="min-h-[160px] p-4 text-[15px] prose prose-sm dark:prose-invert max-w-none bg-secondary/10 rounded-lg overflow-y-auto border border-border/40 scrollbar-hide">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {description || "_No description provided._"}
              </ReactMarkdown>
            </div>
          ) : (
            <Textarea
              placeholder="Add details... (Markdown supported)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[200px] text-[15px] leading-relaxed resize-none border-none shadow-none focus-visible:ring-0 p-0 bg-transparent hover:bg-secondary/10 focus:bg-transparent rounded-lg placeholder:text-muted-foreground/40 overflow-y-auto transition-colors scrollbar-hide"
            />
          )}
        </div>

        {/* Subtasks / Checklist */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="type-ui text-muted-foreground/70 uppercase tracking-widest font-bold">
              Subtasks
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                trigger(15);
                setShowSubtasks(!showSubtasks);
              }}
              className={cn(
                "h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-all [&_svg]:!size-4 rounded-lg border-border/40",
                showSubtasks &&
                  "text-brand bg-brand/10 border-brand/20 hover:bg-brand/20 hover:text-brand",
              )}
              title="Toggle subtasks"
            >
              <ListChecks strokeWidth={2.25} />
            </Button>
          </div>

          {showSubtasks && (
            <div className="pl-1">
              <SubtaskList
                taskId={initialTask.id}
                projectId={initialTask.project_id || inboxProjectId}
                draftSubtasks={draftSubtasks}
                onDraftSubtasksChange={setDraftSubtasks}
              />
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer - Actions Row */}
      <div
        className={cn(
          "shrink-0 grid grid-cols-[1fr_auto] gap-4 pt-6 border-t border-border/40 mt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-background w-full max-w-full",
          hideDialogHeader ? "px-8 md:px-12" : "px-4 sm:px-0",
        )}
      >
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto scrollbar-hide pr-8 py-1 min-w-0 mask-linear-horizontal"
        >
          {/* Date & Time Picker (Due Date) */}
          <TaskDatePicker
            date={dueDate}
            setDate={setDueDate}
            isMobile={isMobile}
            open={datePickerOpen}
            onOpenChange={setDatePickerOpen}
            variant="icon"
          />

          {/* Start Date (Do Date) */}
          <TaskDatePicker
            date={doDate}
            setDate={setDoDate}
            isMobile={isMobile}
            open={doDatePickerOpen}
            onOpenChange={setDoDatePickerOpen}
            variant="icon"
            title="Start Date"
            icon={CalendarClock}
          />

          {/* This Evening Toggle */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-10 px-4 text-xs border border-border/50 bg-background hover:bg-accent hover:text-accent-foreground shrink-0 gap-2 rounded-lg transition-seijaku-fast",
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
            title="This Evening"
          >
            <Moon className="h-3.5 w-3.5" strokeWidth={2.25} />
            {!isMobile && <span className="font-medium">Evening</span>}
          </Button>

          {/* Priority Selector */}
          <div className="shrink-0">
            <TaskPrioritySelect
              priority={priority}
              setPriority={setPriority}
              variant="icon"
            />
          </div>

          {/* Recurrence Picker */}
          <div className="shrink-0">
            <RecurrencePicker
              value={recurrence}
              onChange={setRecurrence}
              variant="icon"
            />
          </div>

          {/* Project Selector - Themed to align with Zen-Modernism */}
          <Select
            value={selectedProjectId || "inbox"}
            onValueChange={(v) => {
              trigger(15);
              setSelectedProjectId(v === "inbox" ? null : v);
            }}
          >
            <SelectTrigger
              onPointerDown={() => trigger(15)}
              className={cn(
                "h-10 w-[120px] md:w-[140px] type-ui border-border/50 bg-background hover:bg-accent hover:text-accent-foreground shrink-0 focus:ring-0 rounded-lg",
                selectedProjectId ? "min-w-20" : "min-w-12",
              )}
            >
              <SelectValue placeholder="Inbox" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-border/80 shadow-2xl">
              <SelectItem value="inbox">
                <div className="flex items-center gap-2">
                  <Inbox className="h-3.5 w-3.5" strokeWidth={2.25} />
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
                      <span className="truncate font-medium">
                        {project.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-seijaku-fast [&_svg]:!size-5 rounded-lg"
            onClick={() => {
              trigger(50);
              onDelete();
            }}
            title="Delete task"
          >
            <Trash2 strokeWidth={1.5} />
          </Button>

          {/* Submit Button - Solid Finish Stroke */}
          <Button
            size="sm"
            variant={isPending ? "ghost" : "default"}
            className={cn(
              "h-10 w-10 p-0 rounded-lg [&_svg]:!size-5 transition-seijaku",
              !isPending &&
                "bg-brand hover:bg-brand/90 text-brand-foreground shadow-lg shadow-brand/10",
            )}
            onClick={() => {
              trigger([10, 50]);
              onSubmit();
            }}
            disabled={!hasContent || isPending}
            title="Save changes"
          >
            <Save strokeWidth={2} className={cn(isPending && "opacity-50")} />
          </Button>
        </div>
      </div>
    </div>
  );
}
