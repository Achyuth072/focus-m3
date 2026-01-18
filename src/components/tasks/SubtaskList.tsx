import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { useSubtasks } from "@/lib/hooks/useSubtasks";
import {
  useCreateTask,
  useToggleTask,
  useDeleteTask,
} from "@/lib/hooks/useTaskMutations";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/lib/hooks/useHaptic";

interface SubtaskListProps {
  taskId?: string;
  projectId: string | null;
  draftSubtasks?: string[];
  onDraftSubtasksChange?: (subtasks: string[]) => void;
}

export default function SubtaskList({
  taskId,
  projectId,
  draftSubtasks = [],
  onDraftSubtasksChange,
}: SubtaskListProps) {
  const [newSubtaskContent, setNewSubtaskContent] = useState("");
  const { data: subtasks } = useSubtasks(taskId || null);
  const createMutation = useCreateTask();
  const toggleMutation = useToggleTask();
  const deleteMutation = useDeleteTask();
  const { trigger } = useHaptic();

  const isDraftMode = !taskId;

  const handleAddSubtask = (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = newSubtaskContent.trim();
    if (!content) return;

    if (isDraftMode) {
      onDraftSubtasksChange?.([...draftSubtasks, content]);
      setNewSubtaskContent("");
    } else {
      createMutation.mutate(
        {
          content,
          project_id: projectId || undefined,
          parent_id: taskId,
          priority: 4,
        },
        {
          onSuccess: () => {
            setNewSubtaskContent("");
          },
        },
      );
    }
  };

  const handleDeleteSubtask = (idOrIndex: string | number) => {
    if (isDraftMode) {
      const index = idOrIndex as number;
      onDraftSubtasksChange?.(draftSubtasks.filter((_, i) => i !== index));
    } else {
      deleteMutation.mutate(idOrIndex as string);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const items = isDraftMode ? draftSubtasks : subtasks || [];

  return (
    <div className="space-y-4">
      {/* Existing Subtasks */}
      <div className="space-y-1">
        {items.map((item, index) => {
          const id = typeof item === "string" ? `draft-${index}` : item.id;
          const content = typeof item === "string" ? item : item.content;
          const isCompleted =
            typeof item === "string" ? false : item.is_completed;

          return (
            <div
              key={id}
              className="group flex items-center gap-3 py-2 px-3 hover:bg-secondary/10 rounded-lg transition-colors"
            >
              <Checkbox
                checked={isCompleted}
                onCheckedChange={(checked) => {
                  if (!isDraftMode && typeof item !== "string") {
                    trigger(15);
                    toggleMutation.mutate({
                      id: item.id,
                      is_completed: checked as boolean,
                    });
                  }
                }}
                disabled={isDraftMode}
                className="mt-0.5 !rounded-sm border-muted-foreground/40 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
              />
              <span
                className={cn(
                  "flex-1 text-[14px] leading-tight transition-all break-all",
                  isCompleted &&
                    "text-muted-foreground/60 line-through decoration-muted-foreground/30",
                )}
              >
                {content}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                onClick={() => {
                  trigger(10);
                  handleDeleteSubtask(
                    isDraftMode ? index : (item as { id: string }).id,
                  );
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Add New Subtask Input */}
      <div className="flex items-center gap-2 px-3">
        <div className="flex-1 relative group">
          <Plus className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-brand transition-colors" />
          <Input
            value={newSubtaskContent}
            onChange={(e) => setNewSubtaskContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a step..."
            className="h-10 pl-8 text-[14px] bg-transparent border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/30 transition-colors p-0"
          />
        </div>
      </div>
    </div>
  );
}
