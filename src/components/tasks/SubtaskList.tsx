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
  useUpdateTask,
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [newSubtaskContent, setNewSubtaskContent] = useState("");

  const { data: subtasks } = useSubtasks(taskId || null);
  const createMutation = useCreateTask();
  const toggleMutation = useToggleTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const { trigger } = useHaptic();

  const isDraftMode = !taskId;

  const handleStartEdit = (id: string, content: string) => {
    if (isDraftMode) return;
    setEditingId(id);
    setEditingContent(content);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingContent.trim()) {
      handleDeleteSubtask(id);
    } else {
      updateMutation.mutate({
        id,
        content: editingContent.trim(),
      });
    }
    setEditingId(null);
  };

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

  const handleKeyDown = (e: React.KeyboardEvent, id?: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (id) {
        handleSaveEdit(id);
      } else {
        handleAddSubtask();
      }
    } else if (e.key === "Escape" && id) {
      setEditingId(null);
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
          const isEditing = editingId === id;

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
              {isEditing ? (
                <Input
                  autoFocus
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  onBlur={() => handleSaveEdit(id)}
                  onKeyDown={(e) => handleKeyDown(e, id)}
                  className="flex-1 h-7 py-0 px-0 text-[15px] bg-transparent border-none shadow-none focus-visible:ring-0"
                />
              ) : (
                <span
                  onClick={() => !isDraftMode && handleStartEdit(id, content)}
                  className={cn(
                    "flex-1 text-[15px] leading-tight transition-all break-all cursor-text",
                    isCompleted &&
                      "text-muted-foreground/60 line-through decoration-muted-foreground/30",
                  )}
                >
                  {content}
                </span>
              )}
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
      <div className="flex items-center gap-3 px-3 pt-1 group">
        <div className="flex items-center justify-center w-4 h-4 shrink-0">
          <Plus
            className="h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-brand transition-colors"
            strokeWidth={2.25}
          />
        </div>
        <Input
          value={newSubtaskContent}
          onChange={(e) => setNewSubtaskContent(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e)}
          placeholder="Add a step..."
          className="flex-1 h-9 text-[15px] bg-transparent border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/30 transition-colors p-0"
        />
      </div>
    </div>
  );
}
