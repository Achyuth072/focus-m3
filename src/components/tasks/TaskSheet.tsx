"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
} from "@/components/ui/responsive-dialog";
import { DeleteConfirmationDialog } from "@/components/ui/DeleteConfirmationDialog";
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/lib/hooks/useTaskMutations";
import { useInboxProject } from "@/lib/hooks/useTasks";
import { useProjects } from "@/lib/hooks/useProjects";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/task";
import type { RecurrenceRule } from "@/lib/utils/recurrence";
import { TaskCreateView } from "./TaskCreateView";
import { TaskEditView } from "./TaskEditView";

interface TaskSheetProps {
  open: boolean;
  onClose: () => void;
  initialTask?: Task | null;
  initialDate?: Date | null;
}

export default function TaskSheet({
  open,
  onClose,
  initialTask,
  initialDate,
}: TaskSheetProps) {
  // Form State
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [doDate, setDoDate] = useState<Date | undefined>(undefined);
  const [isEvening, setIsEvening] = useState(false);
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(4);
  const [recurrence, setRecurrence] = useState<RecurrenceRule | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [doDatePickerOpen, setDoDatePickerOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [draftSubtasks, setDraftSubtasks] = useState<string[]>([]);
  const [showSubtasks, setShowSubtasks] = useState(false);

  // Hooks
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const { data: inboxProject } = useInboxProject();
  const { data: projects } = useProjects();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (initialTask) {
        setContent(initialTask.content);
        setDescription(initialTask.description || "");
        setDueDate(initialTask.due_date ? new Date(initialTask.due_date) : undefined);
        setDoDate(initialTask.do_date ? new Date(initialTask.do_date) : undefined);
        setIsEvening(initialTask.is_evening || false);
        setPriority(initialTask.priority);
        setRecurrence(initialTask.recurrence || null);
        setDraftSubtasks([]);
        setSelectedProjectId(initialTask.project_id);
        setIsPreviewMode(!!initialTask.description);
      } else {
        setContent("");
        setDescription("");
        setDueDate(initialDate ?? undefined);
        setDoDate(undefined);
        setIsEvening(false);
        setPriority(4);
        setRecurrence(null);
        setDraftSubtasks([]);
        setSelectedProjectId(null);
        setIsPreviewMode(false);
        setShowSubtasks(false);
      }
    }
  }, [open, initialTask, initialDate]);

  // Handlers
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
        do_date: doDate?.toISOString() ?? null,
        is_evening: isEvening,
        priority,
        project_id: selectedProjectId,
        recurrence: recurrence,
      });
    } else {
      createMutation.mutate(
        {
          content: trimmedContent,
          description: description.trim() || undefined,
          project_id: selectedProjectId || undefined,
          due_date: dueDate?.toISOString(),
          do_date: doDate?.toISOString(),
          is_evening: isEvening,
          priority,
          recurrence: recurrence,
        },
        {
          onSuccess: (parentTask) => {
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

  // Derived State
  const hasContent = content.trim().length > 0;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isCreationMode = !initialTask;

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogContent
        className="w-full sm:max-w-lg gap-0 rounded-lg"
      >
        {isCreationMode ? (
          <TaskCreateView
            content={content}
            setContent={setContent}
            dueDate={dueDate}
            setDueDate={setDueDate}
            doDate={doDate}
            setDoDate={setDoDate}
            isEvening={isEvening}
            setIsEvening={setIsEvening}
            priority={priority}
            setPriority={setPriority}
            recurrence={recurrence}
            setRecurrence={setRecurrence}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            datePickerOpen={datePickerOpen}
            setDatePickerOpen={setDatePickerOpen}
            doDatePickerOpen={doDatePickerOpen}
            setDoDatePickerOpen={setDoDatePickerOpen}
            showSubtasks={showSubtasks}
            setShowSubtasks={setShowSubtasks}
            draftSubtasks={draftSubtasks}
            setDraftSubtasks={setDraftSubtasks}
            inboxProjectId={inboxProject?.id || null}
            projects={projects}
            isMobile={isMobile}
            hasContent={hasContent}
            isPending={isPending}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <TaskEditView
            initialTask={initialTask!}
            content={content}
            setContent={setContent}
            description={description}
            setDescription={setDescription}
            isPreviewMode={isPreviewMode}
            setIsPreviewMode={setIsPreviewMode}
            dueDate={dueDate}
            setDueDate={setDueDate}
            doDate={doDate}
            setDoDate={setDoDate}
            isEvening={isEvening}
            setIsEvening={setIsEvening}
            priority={priority}
            setPriority={setPriority}
            recurrence={recurrence}
            setRecurrence={setRecurrence}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            datePickerOpen={datePickerOpen}
            setDatePickerOpen={setDatePickerOpen}
            doDatePickerOpen={doDatePickerOpen}
            setDoDatePickerOpen={setDoDatePickerOpen}
            showSubtasks={showSubtasks}
            setShowSubtasks={setShowSubtasks}
            draftSubtasks={draftSubtasks}
            setDraftSubtasks={setDraftSubtasks}
            inboxProjectId={inboxProject?.id || null}
            projects={projects}
            isMobile={isMobile}
            hasContent={hasContent}
            isPending={isPending}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            onKeyDown={handleKeyDown}
          />
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
