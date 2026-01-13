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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProject } from "@/lib/hooks/useProjectMutations";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { cn } from "@/lib/utils";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Curated color palette for projects
const PROJECT_COLORS = [
  { name: "Berry", value: "#E91E63" },
  { name: "Red", value: "#F44336" },
  { name: "Orange", value: "#FF9800" },
  { name: "Yellow", value: "#FFEB3B" },
  { name: "Green", value: "#4CAF50" },
  { name: "Teal", value: "#009688" },
  { name: "Blue", value: "#2196F3" },
  { name: "Indigo", value: "#3F51B5" },
  { name: "Purple", value: "#9C27B0" },
  { name: "Grey", value: "#607D8B" },
];

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
      color: PROJECT_COLORS[6].value,
      view_style: "list",
    },
  });

  const color = useWatch({
    control,
    name: "color",
    defaultValue: PROJECT_COLORS[6].value,
  });
  const createProject = useCreateProject();
  const { trigger } = useHaptic();

  const onFormSubmit = async (data: CreateProjectInput) => {
    trigger(50);
    await createProject.mutateAsync(data);
    reset();
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent
        className="sm:max-w-[400px] p-0 overflow-hidden"
        aria-describedby="project-dialog-description"
      >
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col h-auto max-h-[90dvh]"
        >
          <ResponsiveDialogHeader className="px-4 pt-6 shrink-0">
            <ResponsiveDialogTitle>Create Project</ResponsiveDialogTitle>
            <ResponsiveDialogDescription id="project-dialog-description">
              Organize your tasks into a new project.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Name</Label>
              <Input
                {...register("name")}
                id="project-name"
                placeholder="Work, Personal, School..."
                autoFocus
                className={cn(
                  "h-12 sm:h-10 text-base",
                  errors.name &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={!!errors.name}
                aria-describedby={
                  errors.name ? "project-name-error" : undefined
                }
              />
              {errors.name && (
                <p
                  id="project-name-error"
                  className="text-xs font-medium text-destructive"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <div
                className="flex flex-wrap gap-3 sm:gap-2"
                role="radiogroup"
                aria-label="Project color"
              >
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    role="radio"
                    aria-checked={color === c.value}
                    onClick={() => {
                      trigger(25);
                      setValue("color", c.value, { shouldValidate: true });
                    }}
                    className={cn(
                      "h-10 w-10 sm:h-8 sm:w-8 rounded-xl transition-all border-2",
                      color === c.value
                        ? "border-current opacity-100"
                        : "border-transparent opacity-70 hover:opacity-90"
                    )}
                    style={{
                      backgroundColor: c.value,
                      borderColor: color === c.value ? c.value : "transparent",
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
                trigger(10);
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || createProject.isPending}
            >
              {createProject.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
