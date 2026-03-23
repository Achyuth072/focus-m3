"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useArchiveProject, useMoveTasksToInbox, useDeleteProjectTasks } from "@/lib/hooks/useProjectMutations";
import type { Project } from "@/lib/types/task";
import { cn } from "@/lib/utils";
import { Inbox, ArchiveRestore, Trash2, Loader2 } from "lucide-react";

interface DeleteProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ActionType = "inbox" | "delete" | "keep" | null;

export function DeleteProjectDialog({ project, open, onOpenChange }: DeleteProjectDialogProps) {
  const archiveProject = useArchiveProject();
  const moveTasksToInbox = useMoveTasksToInbox();
  const deleteProjectTasks = useDeleteProjectTasks();
  
  const [selectedOption, setSelectedOption] = useState<ActionType>("inbox");
  const isPending = archiveProject.isPending || moveTasksToInbox.isPending || deleteProjectTasks.isPending;
  
  // Close on success
  useEffect(() => {
    if (archiveProject.isSuccess && selectedOption) {
      onOpenChange(false);
      setSelectedOption("inbox");
    }
  }, [archiveProject.isSuccess, selectedOption, onOpenChange]);
  
  // Reset on error
  useEffect(() => {
    if (archiveProject.isError) {
      // Keep selected option but allow retry
    }
  }, [archiveProject.isError]);

  const handleConfirm = async () => {
    if (!project) return;
    
    if (selectedOption === "inbox") {
      await moveTasksToInbox.mutateAsync(project.id);
    } else if (selectedOption === "delete") {
      await deleteProjectTasks.mutateAsync(project.id);
    }
    
    archiveProject.mutate(project.id);
  };
  
  if (!project) return null;

  const options = [
    {
      id: "inbox",
      title: "Move to Inbox",
      description: "Keep your tasks and move them to the Inbox for later.",
      icon: Inbox,
      destructive: false,
    },
    {
      id: "keep",
      title: "Keep Archived",
      description: "Archive the project and tasks. They won't be visible in active lists.",
      icon: ArchiveRestore,
      destructive: false,
    },
    {
      id: "delete",
      title: "Delete All Tasks",
      description: "Permanently delete the project and all of its tasks.",
      icon: Trash2,
      destructive: true,
    },
  ] as const;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Choose what happens to the tasks in "{project.name}".
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedOption === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-200",
                  "flex items-start gap-4",
                  isSelected 
                    ? option.destructive 
                      ? "bg-destructive/10 border-destructive ring-1 ring-destructive"
                      : "bg-primary/5 border-primary ring-1 ring-primary"
                    : "bg-card hover:bg-muted border-border"
                )}
              >
                <div className={cn(
                  "mt-1 p-2 rounded-lg shrink-0",
                  isSelected
                    ? option.destructive ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{option.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel disabled={isPending} className="sm:flex-1">
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              "sm:flex-1",
              selectedOption === "delete" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Working...
              </>
            ) : "Confirm"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
