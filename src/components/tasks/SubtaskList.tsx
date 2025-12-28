import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { useSubtasks } from "@/lib/hooks/useSubtasks";
import { useCreateTask, useToggleTask, useDeleteTask } from "@/lib/hooks/useTaskMutations";
import { cn } from "@/lib/utils";

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
  onDraftSubtasksChange
}: SubtaskListProps) {
  const [newSubtaskContent, setNewSubtaskContent] = useState("");
  const { data: subtasks, isLoading } = useSubtasks(taskId || null);
  const createMutation = useCreateTask();
  const toggleMutation = useToggleTask();
  const deleteMutation = useDeleteTask();

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
        }
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

  // if (isLoading && taskId) {
  //   return <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">Loading checklist...</div>;
  // }

  const items = isDraftMode ? draftSubtasks : subtasks || [];

  return (
    <div className="space-y-3">
      {/* Existing Subtasks */}
      <div className="space-y-1">
        {items.map((item, index) => {
          const id = typeof item === 'string' ? `draft-${index}` : item.id;
          const content = typeof item === 'string' ? item : item.content;
          const isCompleted = typeof item === 'string' ? false : item.is_completed;

          return (
            <div
              key={id}
              className="group flex items-center gap-3 py-1.5 px-2 hover:bg-secondary/30 rounded-md transition-colors"
            >
              <Checkbox
                checked={isCompleted}
                onCheckedChange={(checked) => {
                  if (!isDraftMode && typeof item !== 'string') {
                    toggleMutation.mutate({ id: item.id, is_completed: checked as boolean });
                  }
                }}
                disabled={isDraftMode}
                className="mt-0.5"
              />
              <span
                className={cn(
                  "flex-1 text-sm transition-all break-all",
                  isCompleted && "text-muted-foreground line-through decoration-muted-foreground/50"
                )}
              >
                {content}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteSubtask(isDraftMode ? index : (item as any).id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Add New Subtask Input */}
      <div className="flex items-center gap-2 px-2">
        <div className="flex-1 relative">
           <Plus className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
           <Input
            value={newSubtaskContent}
            onChange={(e) => setNewSubtaskContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a step..."
            className="h-9 pl-8 text-sm bg-transparent border-transparent hover:bg-secondary/20 focus-visible:bg-secondary/20 focus-visible:ring-0 placeholder:text-muted-foreground/60 transition-colors"
           />
        </div>
      </div>
    </div>
  );
}
