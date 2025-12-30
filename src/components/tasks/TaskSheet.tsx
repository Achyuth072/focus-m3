"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { DateTimeWizard } from "@/components/ui/date-time-wizard";
import { DeleteConfirmationDialog } from "@/components/ui/DeleteConfirmationDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/lib/hooks/useTaskMutations";
import { useInboxProject } from "@/lib/hooks/useTasks";
import {
  Calendar as CalendarIcon,
  Flag,
  Trash2,
  X,
  ListTodo,
  Send,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/task";
import SubtaskList from "./SubtaskList";
import { useProjects } from "@/lib/hooks/useProjects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderKanban, Inbox } from "lucide-react";

interface TaskSheetProps {
  open: boolean;
  onClose: () => void;
  initialTask?: Task | null;
  initialDate?: Date | null;
}

const priorities: { value: 1 | 2 | 3 | 4; label: string; color: string }[] = [
  { value: 1, label: "P1", color: "bg-red-500 text-white hover:bg-red-600" },
  {
    value: 2,
    label: "P2",
    color: "bg-orange-500 text-white hover:bg-orange-600",
  },
  { value: 3, label: "P3", color: "bg-blue-500 text-white hover:bg-blue-600" },
  {
    value: 4,
    label: "P4",
    color: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
];

export default function TaskSheet({
  open,
  onClose,
  initialTask,
  initialDate,
}: TaskSheetProps) {
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(4);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const { data: inboxProject } = useInboxProject();
  const { data: projects } = useProjects();

  const [draftSubtasks, setDraftSubtasks] = useState<string[]>([]);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [showSubtasks, setShowSubtasks] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (initialTask) {
        setContent(initialTask.content);
        setDescription(initialTask.description || "");
        setDueDate(
          initialTask.due_date ? new Date(initialTask.due_date) : undefined
        );
        setPriority(initialTask.priority);
        setDraftSubtasks([]);
        setSelectedProjectId(initialTask.project_id);
        // Default to preview if description exists, otherwise write
        setActiveTab(initialTask.description ? "preview" : "write");
      } else {
        setContent("");
        setDescription("");
        setDueDate(initialDate ?? undefined);
        setPriority(4);
        setDraftSubtasks([]);
        setSelectedProjectId(null);
        setActiveTab("write");
        setShowSubtasks(false);
      }
    }
  }, [open, initialTask, initialDate]);

  const handleSubmit = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    onClose();

    if (initialTask) {
      updateMutation.mutate({
        id: initialTask.id,
        content: trimmedContent,
        description: description.trim() || undefined,
        due_date: dueDate?.toISOString() ?? null,
        priority,
        project_id: selectedProjectId,
      });
    } else {
      createMutation.mutate(
        {
          content: trimmedContent,
          description: description.trim() || undefined,
          project_id: selectedProjectId || undefined,
          due_date: dueDate?.toISOString(),
          priority,
        },
        {
          onSuccess: (parentTask) => {
            // If there are draft subtasks, create them
            draftSubtasks.forEach((sContent) => {
              createMutation.mutate({
                content: sContent,
                project_id: parentTask.project_id || undefined,
                parent_id: parentTask.id,
                priority: 4,
              });
            });
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (!initialTask) return;
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!initialTask) return;
    setShowDeleteDialog(false);
    onClose();
    deleteMutation.mutate(initialTask.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") onClose();
  };

  const hasContent = content.trim().length > 0;
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Mode-based rendering: Simple for creation, Full for editing
  const isCreationMode = !initialTask;

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogContent 
        className={cn(
          "w-full sm:max-w-[560px] gap-0 rounded-lg",
          isCreationMode && "sm:top-[35%]"
        )}
      >
        {isCreationMode ? (
          // SIMPLE LAYOUT - Quick Add for Task Creation
          <>
            <ResponsiveDialogHeader className="pb-4">
              <ResponsiveDialogTitle className="sr-only">New Task</ResponsiveDialogTitle>
            </ResponsiveDialogHeader>

            <div className="px-4">
              {/* Task Name Input */}
              <Textarea
                autoFocus
                placeholder="Enter task name"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[48px] text-base font-medium resize-none border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/60"
              />

            {/* Icon Row - Metadata Controls */}
            <div className="flex items-center gap-3 pt-4 pb-3">
              {/* Date Picker */}
              {isMobile ? (
              <ResponsiveDialog open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDatePickerOpen(true)}
                    className={cn(
                      "h-12 min-w-12 px-0 transition-colors",
                      dueDate && "text-primary bg-primary/10 px-3 w-auto"
                    )}
                    title="Set due date"
                  >
                    <div className="flex items-center gap-1.5 px-2">
                      <CalendarIcon className={cn("h-5 w-5 stroke-[1.5px]", dueDate && "text-primary")} />
                      {dueDate && (
                        <>
                          <span className="text-sm font-medium text-primary ml-1">
                            {format(dueDate, "MMM d, h:mm a")}
                          </span>
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDueDate(undefined);
                            }}
                            className="ml-1 p-0.5 rounded-full hover:bg-primary/20"
                          >
                            <X className="h-3 w-3" />
                          </span>
                        </>
                      )}
                    </div>
                  </Button>
                  <ResponsiveDialogContent className="w-full max-w-[320px] mx-auto p-0 h-auto rounded-[10px] mb-4 bg-popover [&>div.h-2]:hidden">
                    <ResponsiveDialogHeader className="sr-only">
                      <ResponsiveDialogTitle>Set Due Date</ResponsiveDialogTitle>
                    </ResponsiveDialogHeader>
                    <DateTimeWizard
                      date={dueDate}
                      setDate={setDueDate}
                      onClose={() => setDatePickerOpen(false)}
                    />
                  </ResponsiveDialogContent>
                </ResponsiveDialog>
              ) : (
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-12 min-w-12 px-0 transition-colors",
                        dueDate && "text-primary bg-primary/10 px-3 w-auto"
                      )}
                      title="Set due date"
                    >
                      <div className="flex items-center gap-1.5 pl-2 pr-1">
                        <CalendarIcon className={cn("h-5 w-5 stroke-[1.5px]", dueDate && "text-primary")} />
                        {dueDate && (
                          <>
                            <span className="text-sm font-medium text-primary ml-1">
                              {format(dueDate, "MMM d, h:mm a")}
                            </span>
                            <span
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDueDate(undefined);
                              }}
                              className="ml-1 p-0.5 rounded-full hover:bg-primary/20"
                            >
                              <X className="h-3 w-3" />
                            </span>
                          </>
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-none shadow-xl" align="start">
                    <DateTimeWizard
                      date={dueDate}
                      setDate={setDueDate}
                      onClose={() => setDatePickerOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              )}

              {/* Subtask Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubtasks(!showSubtasks)}
                className={cn(
                  "h-12 w-12 p-0 transition-colors",
                  showSubtasks && "text-primary bg-primary/10"
                )}
                title="Toggle subtasks"
              >
                <ListTodo className="h-5 w-5 stroke-[1.5px]" />
              </Button>

              {/* Priority Selector */}
              <Select
                value={priority.toString()}
                onValueChange={(v) => setPriority(parseInt(v) as 1 | 2 | 3 | 4)}
              >
                <SelectTrigger
                  className={cn(
                    "h-12 min-w-[3rem] border-none transition-colors",
                    priority !== 4 
                      ? "text-primary bg-primary/10 px-3 w-auto" 
                      : "px-0 w-12 justify-center"
                  )}
                  title="Set priority"
                >
                  <div className="flex items-center gap-1.5">
                    <Flag 
                      className={cn(
                        "h-5 w-5 stroke-[1.5px]",
                        priority === 1 ? "text-red-500 fill-red-500" :
                        priority === 2 ? "text-orange-500 fill-orange-500" :
                        priority === 3 ? "text-blue-500 fill-blue-500" : ""
                      )} 
                    />
                    {/* Only show text/chevron space if priority is set, mimicking the date picker expansion? 
                        Or just keep it as icon if user prefers minimal. 
                        The screenshot shows just an icon + chevron. 
                        SelectTrigger automatically renders children. 
                    */}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value.toString()}>
                      <div className="flex items-center gap-2">
                        <Flag
                          className={cn(
                            "h-3.5 w-3.5",
                            p.value === 4
                              ? "text-muted-foreground"
                              : p.color.split(" ")[0].replace("bg-", "text-")
                          )}
                        />
                        <span className="font-medium">
                          {p.label} -{" "}
                          {p.value === 1
                            ? "Urgent"
                            : p.value === 2
                            ? "High"
                            : p.value === 3
                            ? "Normal"
                            : "Low"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subtasks Section - Collapsible */}
            {showSubtasks && (
              <div className="pt-2 pb-2 border-t">
                <SubtaskList
                  taskId={undefined}
                  projectId={inboxProject?.id || null}
                  draftSubtasks={draftSubtasks}
                  onDraftSubtasksChange={setDraftSubtasks}
                />
              </div>
            )}

            {/* Footer Row - Project & Send */}
            <div className="flex items-center justify-between pt-4 border-t mt-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
              {/* Project Selector */}
              <Select
                value={selectedProjectId || "inbox"}
                onValueChange={(v) => setSelectedProjectId(v === "inbox" ? null : v)}
              >
                <SelectTrigger className="h-8 w-[140px] text-xs border-transparent bg-secondary hover:bg-secondary/80">
                  <SelectValue placeholder="Inbox" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbox">
                    <div className="flex items-center gap-2">
                      <Inbox className="h-3 w-3" />
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
                className="h-9 w-10 p-0 rounded-md [&_svg]:size-5"
                onClick={handleSubmit}
                disabled={!hasContent || isPending}
                title="Create task"
              >
                <Send className="stroke-[1.5px]" />
              </Button>
            </div>
            </div>
          </>
        ) : (
          // FULL LAYOUT - Detailed Edit Mode
          <>
            <ResponsiveDialogHeader className="pb-4">
              <ResponsiveDialogTitle>Edit Task</ResponsiveDialogTitle>
            </ResponsiveDialogHeader>

            {/* Content Input */}
            <Textarea
              autoFocus
              placeholder="What needs to be done?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] text-base font-medium resize-none border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/70"
            />

            {/* Description Input (Markdown) */}
            <div className="px-0 pt-2 pb-2">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "write" | "preview")}
                className="w-full"
              >
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-medium text-muted-foreground ml-1">
                    Description
                  </span>
                  <TabsList className="h-6 p-0 bg-transparent gap-2">
                    <TabsTrigger
                      value="preview"
                      className="h-6 px-2 text-xs data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-sm"
                      disabled={!description.trim()}
                    >
                      View
                    </TabsTrigger>
                    <TabsTrigger
                      value="write"
                      className="h-6 px-2 text-xs data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-sm"
                    >
                      Edit
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="write" className="mt-0">
                  <Textarea
                    placeholder="Add details... (Markdown supported)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] text-sm resize-none border-none shadow-none focus-visible:ring-0 p-2 bg-secondary/30 rounded-md placeholder:text-muted-foreground/60"
                  />
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                  <div className="min-h-[100px] p-2 text-sm prose prose-sm dark:prose-invert max-w-none bg-secondary/10 rounded-md overflow-y-auto max-h-[300px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {description || "*No description*"}
                    </ReactMarkdown>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Subtasks / Checklist */}
            <div className="pt-4 border-t mt-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-muted-foreground ml-1">
                  Checklist
                </span>
              </div>

              <SubtaskList
                taskId={initialTask?.id}
                projectId={initialTask?.project_id || inboxProject?.id || null}
                draftSubtasks={draftSubtasks}
                onDraftSubtasksChange={setDraftSubtasks}
              />
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-2 pt-4 border-t mt-4 overflow-hidden">
              <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide pr-2 mask-linear">
                {/* Date & Time Picker */}
                {isMobile ? (
                  <ResponsiveDialog
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDatePickerOpen(true)}
                      className={cn(
                        "h-8 gap-1.5 font-medium border border-transparent transition-all",
                        !dueDate &&
                          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:border-border",
                        dueDate && "bg-primary/10 text-primary hover:bg-primary/20"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {dueDate ? format(dueDate, "MMM d, h:mm a") : "Due Date"}
                      {dueDate && (
                        <span
                          role="button"
                          title="Clear due date"
                          className="ml-1 p-0.5 rounded hover:bg-destructive/20"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDueDate(undefined);
                          }}
                        >
                          <X className="h-3 w-3 hover:text-destructive" />
                        </span>
                      )}
                    </Button>
                    <ResponsiveDialogContent className="w-full p-0">
                      <DateTimeWizard
                        date={dueDate}
                        setDate={setDueDate}
                        onClose={() => setDatePickerOpen(false)}
                      />
                    </ResponsiveDialogContent>
                  </ResponsiveDialog>
                ) : (
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 gap-1.5 font-medium border border-transparent transition-all",
                          !dueDate &&
                            "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:border-border",
                          dueDate &&
                            "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {dueDate ? format(dueDate, "MMM d, h:mm a") : "Due Date"}
                        {dueDate && (
                          <span
                            role="button"
                            title="Clear due date"
                            className="ml-1 p-0.5 rounded hover:bg-destructive/20"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDueDate(undefined);
                            }}
                          >
                            <X className="h-3 w-3 hover:text-destructive" />
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border-none shadow-xl"
                      align="start"
                    >
                      <DateTimeWizard
                        date={dueDate}
                        setDate={setDueDate}
                        onClose={() => setDatePickerOpen(false)}
                      />
                    </PopoverContent>
                  </Popover>
                )}

                {/* Priority Selector */}
                <Select
                  value={priority.toString()}
                  onValueChange={(v) => setPriority(parseInt(v) as 1 | 2 | 3 | 4)}
                >
                  <SelectTrigger
                    className={cn(
                      "h-8 w-[80px] px-2.5 text-xs font-bold border-transparent transition-all shrink-0",
                      priorities.find((p) => p.value === priority)?.color ||
                        "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <Flag
                        className={cn(
                          "h-3.5 w-3.5",
                          priority === 4 ? "text-muted-foreground" : "text-white"
                        )}
                      />
                      <span>
                        {priorities.find((p) => p.value === priority)?.label}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value.toString()}>
                        <div className="flex items-center gap-2">
                          <Flag
                            className={cn(
                              "h-3.5 w-3.5",
                              p.value === 4
                                ? "text-muted-foreground"
                                : p.color.split(" ")[0].replace("bg-", "text-")
                            )}
                          />
                          <span className="font-medium">
                            {p.label} -{" "}
                            {p.value === 1
                              ? "Urgent"
                              : p.value === 2
                              ? "High"
                              : p.value === 3
                              ? "Normal"
                              : "Low"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Project Selector */}
                <Select
                  value={selectedProjectId || "inbox"}
                  onValueChange={(v) =>
                    setSelectedProjectId(v === "inbox" ? null : v)
                  }
                >
                  <SelectTrigger className="h-8 w-[110px] md:w-[140px] text-xs border-transparent bg-secondary hover:bg-secondary/80 shrink-0">
                    <SelectValue placeholder="Inbox" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbox">
                      <div className="flex items-center gap-2">
                        <Inbox className="h-3 w-3" />
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
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Delete Button (only for existing tasks) */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground/80 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  onClick={handleDelete}
                  title="Delete task"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>

                {/* Submit Button */}
                <Button
                  size="sm"
                  className="h-8 px-4 font-semibold"
                  onClick={handleSubmit}
                  disabled={!hasContent || isPending}
                >
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </>
        )}
      </ResponsiveDialogContent>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        description={`Are you sure you want to delete "${initialTask?.content}"? This action cannot be undone.`}
      />
    </ResponsiveDialog>
  );
}
