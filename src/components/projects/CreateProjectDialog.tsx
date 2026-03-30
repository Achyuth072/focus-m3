"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateProjectSchema,
  type CreateProjectInput,
} from "@/lib/schemas/project";
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
import { useCreateProject } from "@/lib/hooks/useProjectMutations";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { useHorizontalScroll } from "@/lib/hooks/useHorizontalScroll";
import { cn } from "@/lib/utils";
import { PROJECT_COLORS, DEFAULT_PROJECT_COLOR } from "@/lib/constants/colors";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      color: DEFAULT_PROJECT_COLOR,
      view_style: "list",
    },
  });

  const color = useWatch({
    control,
    name: "color",
    defaultValue: DEFAULT_PROJECT_COLOR,
  });
  const createProject = useCreateProject();
  const { trigger } = useHaptic();
  const scrollRef = useHorizontalScroll();
  const isFinePointer = useMediaQuery("(pointer: fine)");

  const onFormSubmit = (data: CreateProjectInput) => {
    trigger("HEAVY");
    createProject.mutate(data);
    reset();
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col h-auto max-h-[90dvh]"
        >
          <ResponsiveDialogHeader className="px-4 pt-6 shrink-0">
            <ResponsiveDialogTitle className="type-h2">
              Create Project
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="sr-only">
              Organize your tasks into a new project.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name" className="sr-only">
                Project Name
              </Label>
              <Textarea
                {...register("name")}
                id="project-name"
                placeholder="Work, Personal, School..."
                autoFocus={isFinePointer}
                className={cn(
                  "text-xl sm:text-2xl font-semibold px-3 py-2 h-10 min-h-[40px] bg-transparent border-border focus-visible:ring-1 focus-visible:ring-ring shadow-sm resize-none placeholder:text-muted-foreground/30 tracking-tight leading-tight rounded-md transition-all",
                  errors.name &&
                    "text-destructive placeholder:text-destructive/50 border-destructive/20 focus-visible:ring-destructive",
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (isValid) {
                      handleSubmit(onFormSubmit)();
                    }
                  }
                }}
                aria-invalid={!!errors.name}
                aria-describedby={
                  errors.name ? "project-name-error" : undefined
                }
              />
              {errors.name && (
                <p
                  id="project-name-error"
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
                className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide py-3 px-1 snap-x snap-mandatory"
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
                      setValue("color", c.hex, { shouldValidate: true });
                    }}
                    className={cn(
                      "h-9 w-9 rounded-xl transition-all shrink-0 snap-start",
                      color === c.hex
                        ? "ring-2 ring-brand ring-offset-2 ring-offset-background scale-110 opacity-100"
                        : "opacity-70 hover:opacity-90 hover:scale-105",
                    )}
                    style={{ backgroundColor: c.hex }}
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
              disabled={!isValid || createProject.isPending}
              className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-lg shadow-brand/10 transition-seijaku h-10 px-6"
            >
              {createProject.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
