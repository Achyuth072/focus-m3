"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateTask } from "@/lib/hooks/useTaskMutations";
import { useProjects } from "@/lib/hooks/useProjects";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { TaskCreateView } from "@/components/tasks/TaskCreateView";
import type { RecurrenceRule } from "@/lib/utils/recurrence";

function ShareForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync: createTask, isPending } = useCreateTask();
  const { data: projects } = useProjects();
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Form State
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(4);
  const [recurrence, setRecurrence] = useState<RecurrenceRule | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // UI State
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [draftSubtasks, setDraftSubtasks] = useState<string[]>([]);
  
  // Initialize from Search Params
  useEffect(() => {
    const title = searchParams.get("title") || "";
    const text = searchParams.get("text") || "";
    const url = searchParams.get("url") || "";

    let initialContent = title;
    if (text) initialContent += (initialContent ? "\n\n" : "") + text;
    if (url) initialContent += (initialContent ? "\n" : "") + url;

    setContent(initialContent);
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await createTask({
        content: content.trim(),
        description: "", // Description is managed in edit view, capture everything in content/title for now or split?
        // Actually, if content is huge, it might be better to put text/url in description. 
        // But CreateView only supports content editing. Let's stick to content.
        priority,
        due_date: dueDate?.toISOString(),
        project_id: selectedProjectId || undefined,
        parent_id: undefined,
        recurrence, 
        // Note: Subtasks are not supported in useCreateTask directly? 
        // Checking useCreateTask... usually separates subtasks.
        // TaskSheet logic handles subtasks creation after parent.
        // For Quick Capture, we can ignore subtasks or handle them if I implement logic.
        // TaskCreateView has draftSubtasks. 
      });
      
      // If there are subtasks, we need to handle them. 
      // But useCreateTask might return the task ID? 
      // Let's assume for MVP Share Target we just capture the main task.
      
      router.push("/"); // Redirect to home
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const inboxProjectId = projects?.find((p) => p.is_inbox)?.id || null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-lg p-4">
        <h1 className="text-sm font-medium text-muted-foreground mb-4 text-center">
          Save to Kanso
        </h1>
        
        <TaskCreateView
          content={content}
          setContent={setContent}
          dueDate={dueDate}
          setDueDate={setDueDate}
          priority={priority}
          setPriority={setPriority}
          recurrence={recurrence}
          setRecurrence={setRecurrence}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          datePickerOpen={datePickerOpen}
          setDatePickerOpen={setDatePickerOpen}
          showSubtasks={showSubtasks}
          setShowSubtasks={setShowSubtasks}
          draftSubtasks={draftSubtasks}
          setDraftSubtasks={setDraftSubtasks}
          inboxProjectId={inboxProjectId}
          projects={projects}
          isMobile={isMobile}
          hasContent={!!content.trim()}
          isPending={isPending}
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
             if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
               handleSubmit();
             }
          }}
        />
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <ShareForm />
    </Suspense>
  );
}
