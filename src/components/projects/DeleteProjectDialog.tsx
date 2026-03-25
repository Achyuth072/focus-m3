"use client";

import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useArchiveProject, useMoveTasksToInbox, useDeleteProjectTasks } from "@/lib/hooks/useProjectMutations";
import type { Project } from "@/lib/types/task";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useBackNavigation } from "@/lib/hooks/useBackNavigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface DeleteProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ActiveAction = "keep" | "inbox" | "delete" | null;

export function DeleteProjectDialog({ project, open, onOpenChange }: DeleteProjectDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const archiveProject = useArchiveProject();
  const moveTasksToInbox = useMoveTasksToInbox();
  const deleteProjectTasks = useDeleteProjectTasks();
  const { trigger } = useHaptic();

  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const isPending = archiveProject.isPending || moveTasksToInbox.isPending || deleteProjectTasks.isPending;

  // Handle back navigation on mobile to close drawer instead of navigating away
  useBackNavigation(open && !isDesktop, () => onOpenChange(false));

  // Haptic on open
  useEffect(() => {
    if (open) trigger("WARNING");
  }, [open, trigger]);

  // Close on success
  useEffect(() => {
    if (archiveProject.isSuccess && activeAction) {
      onOpenChange(false);
      setActiveAction(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archiveProject.isSuccess]);

  if (!project) return null;

  const handleKeepArchived = async () => {
    setActiveAction("keep");
    await archiveProject.mutateAsync(project.id);
    trigger("SUCCESS");
  };

  const handleInbox = async () => {
    setActiveAction("inbox");
    await moveTasksToInbox.mutateAsync(project.id);
    await archiveProject.mutateAsync(project.id);
    trigger("SUCCESS");
  };

  const handleDeleteAll = async () => {
    setActiveAction("delete");
    await deleteProjectTasks.mutateAsync(project.id);
    await archiveProject.mutateAsync(project.id);
    trigger("SUCCESS");
  };

  const description = `Are you sure you want to delete "${project.name}"? Choose what happens to its tasks.`;

  if (isDesktop) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent aria-describedby="delete-project-description">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription id="delete-project-description">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { trigger("LIGHT"); onOpenChange(false); }}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={handleKeepArchived}
            >
              {activeAction === "keep" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Keep Archived
            </Button>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={handleInbox}
            >
              {activeAction === "inbox" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Move to Inbox
            </Button>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {activeAction === "delete" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Delete Project</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <Button
            onClick={handleDeleteAll}
            variant="destructive"
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
          >
            {activeAction === "delete" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete All Tasks
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={handleInbox}
          >
            {activeAction === "inbox" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Move to Inbox
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={handleKeepArchived}
          >
            {activeAction === "keep" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Keep Archived
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full" onClick={() => trigger("LIGHT")}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
