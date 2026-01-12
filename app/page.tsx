"use client";

import { Suspense } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import TaskList from "@/components/tasks/TaskList";
import { format } from "date-fns";
import { TasksPageHeader } from "@/components/tasks/TasksPageHeader";
import { useUiStore } from "@/lib/store/uiStore";
import { useTaskActions } from "@/components/TaskActionsProvider";
import { PlusIcon } from "lucide-react";
import { useHaptic } from "@/lib/hooks/useHaptic";

function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sortBy, groupBy, viewMode, setSortBy, setGroupBy, setViewMode } =
    useUiStore();
  const { openAddTask } = useTaskActions();
  const { trigger } = useHaptic();

  const currentProjectId = searchParams.get("project") || "all";
  const filter = searchParams.get("filter") || undefined;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const today = new Date();
  const greeting = getGreeting();

  return (
    <div className="flex flex-col h-[calc(100dvh-124px)] md:h-dvh">
      <div className="px-6 pt-4 pb-4 flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-0">
        <div>
          <p className="font-serif text-[13px] font-medium text-muted-foreground/80 flex items-center gap-2">
            {format(today, "eeee, MMMM d")}
            {filter && (
              <span className="flex items-center gap-1.5 before:content-['•'] before:text-muted-foreground/40">
                <span className="capitalize text-primary font-medium">
                  {filter === "p1" ? "High Priority" : filter}
                </span>
                <button
                  onClick={() => {
                    trigger(15);
                    router.push("/");
                  }}
                  className="hover:bg-accent/60 p-0.5 rounded-full transition-colors"
                  title="Clear filter"
                >
                  <PlusIcon className="h-3.5 w-3.5 rotate-45" />
                </button>
              </span>
            )}
          </p>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-primary lowercase">
            {greeting}
          </h1>
        </div>

        <div className="flex justify-end w-full md:w-auto">
          <TasksPageHeader
            currentSort={sortBy}
            currentGroup={groupBy}
            viewMode={viewMode}
            onSortChange={setSortBy}
            onGroupChange={setGroupBy}
            onViewModeChange={setViewMode}
            onNewTask={openAddTask}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <TaskList
          sortBy={sortBy}
          groupBy={groupBy}
          projectId={currentProjectId}
          filter={filter}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
