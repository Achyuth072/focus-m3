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
import { useHorizontalScroll } from "@/lib/hooks/useHorizontalScroll";
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
  { name: "Pink", value: "#FF4081" },
  { name: "Cyan", value: "#00BCD4" },
  { name: "Lime", value: "#CDDC39" },
  { name: "Amber", value: "#FFC107" },
  { name: "Deep Orange", value: "#FF5722" },
  { name: "Brown", value: "#795548" },
  { name: "Grey", value: "#607D8B" },
  { name: "Black", value: "#212121" },
  { name: "Rose", value: "#FB7185" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Emerald", value: "#10B981" },
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
  const scrollRef = useHorizontalScroll();

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
      >
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col h-auto max-h-[90dvh]"
        >
          <ResponsiveDialogHeader className="px-4 pt-6 shrink-0">
            <ResponsiveDialogTitle className="type-h2">
              Create Project
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
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
                    "border-destructive focus-visible:ring-destructive",
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
                ref={scrollRef}
                className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide py-1 px-1 snap-x snap-mandatory"
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
                      trigger(15);
                      setValue("color", c.value, { shouldValidate: true });
                    }}
                    className={cn(
                      "h-9 w-9 rounded-xl transition-all border-2 shrink-0 snap-start",
                      color === c.value
                        ? "border-current opacity-100 scale-110 shadow-sm"
                        : "border-transparent opacity-70 hover:opacity-90 hover:scale-105",
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
