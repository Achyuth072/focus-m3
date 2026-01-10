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

import type { Task } from "@/lib/types/task";
import type { RecurrenceRule } from "@/lib/utils/recurrence";
import { TaskCreateView } from "./TaskCreateView";
import { TaskEditView } from "./TaskEditView";
import { useHaptic } from "@/lib/hooks/useHaptic";

interface TaskSheetProps {
  open: boolean;
  onClose: () => void;
  initialTask?: Task | null;
  initialDate?: Date | null;
  initialContent?: string;
}

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTaskSchema, type CreateTaskInput } from "@/lib/schemas/task";

export default function TaskSheet({
  open,
  onClose,
  initialTask,
  initialDate,
  initialContent,
}: TaskSheetProps) {
  // NOTE: uncertain intent — logic preserved to prevent flickering between Create/Edit modes during close animation.
  const [preservedTask, setPreservedTask] = useState<Task | null | undefined>(
    initialTask
  );

  // Update preserved task only when dialog opens with a new task
  useEffect(() => {
    if (open && initialTask !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreservedTask(initialTask);
    }
  }, [open, initialTask]);

  // Use the preserved task for rendering during close animation
  const effectiveTask = open ? initialTask : preservedTask;

  // React Hook Form
  type TaskFormValues = CreateTaskInput & {
    recurrence?: RecurrenceRule | null;
  };

  const {
    handleSubmit,
    setValue,
    control,
    reset,
    trigger: triggerValidation,
    formState: { errors, isValid },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(CreateTaskSchema),
    mode: "onChange",
    defaultValues: {
      content: "",
      description: "",
      priority: 4,
      is_evening: false,
    },
  });

  // Individual UI-only states (not part of task data structure itself)
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [doDatePickerOpen, setDoDatePickerOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [draftSubtasks, setDraftSubtasks] = useState<string[]>([]);
  const [showSubtasks, setShowSubtasks] = useState(false);

  // Form values (for components that need them) via useWatch to satisfy React Compiler
  const content = useWatch({ control, name: "content" });
  const watchedDueDate = useWatch({ control, name: "due_date" });
  const dueDate = watchedDueDate
    ? new Date(watchedDueDate as string)
    : undefined;
  const watchedDoDate = useWatch({ control, name: "do_date" });
  const doDate = watchedDoDate ? new Date(watchedDoDate as string) : undefined;
  const isEvening = useWatch({ control, name: "is_evening" }) ?? false;
  const priority = (useWatch({ control, name: "priority" }) ?? 4) as
    | 1
    | 2
    | 3
    | 4;
  const recurrence = useWatch({
    control,
    name: "recurrence",
  }) as RecurrenceRule | null;
  const selectedProjectId = useWatch({ control, name: "project_id" }) ?? null;
  const description = useWatch({ control, name: "description" }) || "";

  // Hooks
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const { data: inboxProject } = useInboxProject();
  const { data: projects } = useProjects();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { trigger } = useHaptic();

  // Reset form when dialog opens - intentional sync on open
  useEffect(() => {
    if (open) {
      if (initialTask) {
        reset({
          content: initialTask.content,
          description: initialTask.description || "",
          due_date: initialTask.due_date ?? undefined,
          do_date: initialTask.do_date ?? undefined,
          is_evening: initialTask.is_evening || false,
          priority: initialTask.priority,
          project_id: initialTask.project_id ?? undefined,
        });
        // Trigger validation after reset to ensure isValid reflects the form state
        void triggerValidation();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraftSubtasks([]);
        setIsPreviewMode(!!initialTask.description);
      } else {
        reset({
          content: initialContent || "",
          description: "",
          due_date: initialDate?.toISOString() ?? undefined,
          do_date: undefined,
          is_evening: false,
          priority: 4,
          project_id: undefined,
        });
        setDraftSubtasks([]);
        setIsPreviewMode(false);
        setShowSubtasks(false);
      }
    }
  }, [
    open,
    initialTask,
    initialDate,
    initialContent,
    reset,
    triggerValidation,
  ]);

  // Handlers
  const onFormSubmit = (data: CreateTaskInput) => {
    trigger(50); // Haptic feedback on save

    if (initialTask) {
      updateMutation.mutate({
        ...data,
        id: initialTask.id,
        due_date:
          data.due_date instanceof Date
            ? data.due_date.toISOString()
            : data.due_date || null,
        do_date:
          data.do_date instanceof Date
            ? data.do_date.toISOString()
            : data.do_date || null,
      });
    } else {
      // Build the create input with correct types
      const createInput = {
        content: data.content,
        description: data.description,
        priority: data.priority,
        due_date:
          data.due_date instanceof Date
            ? data.due_date.toISOString()
            : typeof data.due_date === "string"
            ? data.due_date
            : undefined,
        do_date:
          data.do_date instanceof Date
            ? data.do_date.toISOString()
            : typeof data.do_date === "string"
            ? data.do_date
            : undefined,
        is_evening: data.is_evening,
        project_id: data.project_id ?? undefined,
        parent_id: data.parent_id,
        recurrence: recurrence,
      };

      createMutation.mutate(createInput, {
        onSuccess: (parentTask) => {
          draftSubtasks.forEach((sContent) => {
            createMutation.mutate({
              content: sContent,
              project_id: parentTask.project_id || undefined,
              parent_id: parentTask.id,
              priority: 4,
            });
          });
          setDraftSubtasks([]);
        },
      });
    }

    onClose();
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
      handleSubmit(onFormSubmit)();
    }
    if (e.key === "Escape") onClose();
  };

  // Derived State
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isCreationMode = !effectiveTask;

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogContent
        className="w-full sm:max-w-lg gap-0 rounded-lg"
        aria-describedby={undefined}
      >
        {isCreationMode ? (
          <TaskCreateView
            content={content}
            setContent={(v) => setValue("content", v, { shouldValidate: true })}
            dueDate={dueDate}
            setDueDate={(v) =>
              setValue("due_date", v, { shouldValidate: true })
            }
            doDate={doDate}
            setDoDate={(v) => setValue("do_date", v, { shouldValidate: true })}
            isEvening={isEvening}
            setIsEvening={(v) =>
              setValue("is_evening", v, { shouldValidate: true })
            }
            priority={priority}
            setPriority={(v) =>
              setValue("priority", v, { shouldValidate: true })
            }
            recurrence={recurrence}
            setRecurrence={(v) =>
              setValue("recurrence", v, { shouldValidate: true })
            }
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={(v) =>
              setValue("project_id", v, { shouldValidate: true })
            }
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
            hasContent={isValid}
            isPending={isPending}
            onSubmit={handleSubmit(onFormSubmit)}
            onKeyDown={handleKeyDown}
            errors={errors}
          />
        ) : (
          <TaskEditView
            initialTask={initialTask!}
            content={content}
            setContent={(v) => setValue("content", v, { shouldValidate: true })}
            description={description}
            setDescription={(v) =>
              setValue("description", v, { shouldValidate: true })
            }
            isPreviewMode={isPreviewMode}
            setIsPreviewMode={setIsPreviewMode}
            dueDate={dueDate}
            setDueDate={(v) =>
              setValue("due_date", v, { shouldValidate: true })
            }
            doDate={doDate}
            setDoDate={(v) => setValue("do_date", v, { shouldValidate: true })}
            isEvening={isEvening}
            setIsEvening={(v) =>
              setValue("is_evening", v, { shouldValidate: true })
            }
            priority={priority}
            setPriority={(v) =>
              setValue("priority", v, { shouldValidate: true })
            }
            recurrence={recurrence}
            setRecurrence={(v) =>
              setValue("recurrence", v, { shouldValidate: true })
            }
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={(v) =>
              setValue("project_id", v, { shouldValidate: true })
            }
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
            hasContent={isValid}
            isPending={isPending}
            onSubmit={handleSubmit(onFormSubmit)}
            onDelete={handleDelete}
            onKeyDown={handleKeyDown}
            errors={errors}
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
