"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateProject } from "@/lib/hooks/useProjectMutations";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { useHorizontalScroll } from "@/lib/hooks/useHorizontalScroll";
import { cn } from "@/lib/utils";
import { PROJECT_COLORS } from "@/lib/constants/colors";
import type { Project } from "@/lib/types/task";

const EditProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  color: z.string(),
});

type EditProjectInput = z.infer<typeof EditProjectSchema>;

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: EditProjectDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<EditProjectInput>({
    resolver: zodResolver(EditProjectSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      color: PROJECT_COLORS[0].hex,
    },
  });

  const color = useWatch({
    control,
    name: "color",
    defaultValue: PROJECT_COLORS[0].hex,
  });

  const updateProject = useUpdateProject();
  const { trigger } = useHaptic();
  const scrollRef = useHorizontalScroll();

  // Sync form with project when opened
  useEffect(() => {
    if (project && open) {
      reset({
        name: project.name,
        color: project.color,
      });
    }
  }, [project, open, reset]);

  const onFormSubmit = (data: EditProjectInput) => {
    if (!project) return;
    trigger("SUCCESS");
    updateProject.mutate({
      id: project.id,
      name: data.name,
      color: data.color,
    });
    onOpenChange(false);
  };

  if (!project) return null;

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col h-auto max-h-[90dvh]"
        >
          <ResponsiveDialogHeader className="px-4 pt-6 shrink-0">
            <ResponsiveDialogTitle className="type-h2">
              Edit Project
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="sr-only">
              Update project name and color.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-project-name" className="sr-only">
                Project Name
              </Label>
              <Textarea
                {...register("name")}
                id="edit-project-name"
                placeholder="Project name..."
                autoFocus
                className={cn(
                  "text-xl sm:text-2xl font-semibold px-3 py-2 h-10 min-h-[40px] bg-transparent border-border focus-visible:ring-1 focus-visible:ring-ring shadow-sm resize-none placeholder:text-muted-foreground/30 tracking-tight leading-tight rounded-md transition-all",
                  errors.name &&
                    "text-destructive placeholder:text-destructive/50 border-destructive/20 focus-visible:ring-destructive",
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (isValid && isDirty) {
                      handleSubmit(onFormSubmit)();
                    }
                  }
                }}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "edit-project-name-error" : undefined}
              />
              {errors.name && (
                <p
                  id="edit-project-name-error"
                  className="text-xs font-medium text-destructive mt-1"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <div
                ref={scrollRef}
                className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide py-1 px-1 snap-x snap-mandatory"
                role="radiogroup"
                aria-label="Project color"
              >
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    role="radio"
                    aria-checked={color === c.hex}
                    onClick={() => {
                      trigger("MEDIUM");
                      setValue("color", c.hex, { shouldValidate: true, shouldDirty: true });
                    }}
                    className={cn(
                      "h-9 w-9 rounded-xl transition-all border-2 shrink-0 snap-start",
                      color === c.hex
                        ? "border-current opacity-100 scale-110 shadow-sm"
                        : "border-transparent opacity-70 hover:opacity-90 hover:scale-105",
                    )}
                    style={{
                      backgroundColor: c.hex,
                      borderColor: color === c.hex ? c.hex : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex justify-end gap-3 p-4 border-t pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                trigger("LIGHT");
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || !isDirty || updateProject.isPending}
              className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-lg shadow-brand/10 transition-seijaku h-10 px-6"
            >
              {updateProject.isPending ? "Saving..." : "Save Project"}
            </Button>
          </div>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
