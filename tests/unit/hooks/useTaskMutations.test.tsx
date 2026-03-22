import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReorderTasks } from "@/lib/hooks/useTaskMutations";
import type { Task } from "@/lib/types/task";
import React from "react";

// Mock dependencies
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    }),
  }),
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({ isGuestMode: false, user: { id: "test-user" } }),
}));

vi.mock("@/lib/hooks/useHaptic", () => ({
  useHaptic: () => ({ trigger: vi.fn() }),
}));

vi.mock("@/lib/mutations/task", () => ({
  taskMutations: {
    reorder: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/lib/utils/mutation-error", () => ({
  handleMutationError: vi.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe("useReorderTasks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it("optimistically reorders tasks in cache on mutate", async () => {
    // Seed cache with tasks
    const initialTasks: Partial<Task>[] = [
      { id: "1", content: "Task A", day_order: 0 },
      { id: "2", content: "Task B", day_order: 1 },
      { id: "3", content: "Task C", day_order: 2 },
    ];
    queryClient.setQueryData(["tasks"], initialTasks);

    const { result } = renderHook(() => useReorderTasks(), {
      wrapper: createWrapper(queryClient),
    });

    // Reorder: move Task C to first position
    result.current.mutate(["3", "1", "2"]);

    // Check cache was updated optimistically
    await waitFor(() => {
      const cached = queryClient.getQueryData<Partial<Task>[]>(["tasks"]);
      expect(cached?.[0]?.id).toBe("3");
      expect(cached?.[1]?.id).toBe("1");
      expect(cached?.[2]?.id).toBe("2");
    });
  });

  it("rolls back cache on mutation error", async () => {
    const { taskMutations } = await import("@/lib/mutations/task");
    vi.mocked(taskMutations.reorder).mockRejectedValueOnce(
      new Error("Network error"),
    );

    // Seed cache with tasks
    const initialTasks: Partial<Task>[] = [
      { id: "1", content: "Task A", day_order: 0 },
      { id: "2", content: "Task B", day_order: 1 },
    ];
    queryClient.setQueryData(["tasks"], initialTasks);

    const { result } = renderHook(() => useReorderTasks(), {
      wrapper: createWrapper(queryClient),
    });

    // Attempt reorder that will fail
    result.current.mutate(["2", "1"]);

    // Wait for error handling
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Cache should be rolled back to original order
    const cached = queryClient.getQueryData<Partial<Task>[]>(["tasks"]);
    expect(cached?.[0]?.id).toBe("1");
    expect(cached?.[1]?.id).toBe("2");
  });

  it("updates day_order for each task in new order", async () => {
    const initialTasks: Partial<Task>[] = [
      { id: "1", content: "Task A", day_order: 0 },
      { id: "2", content: "Task B", day_order: 1 },
      { id: "3", content: "Task C", day_order: 2 },
    ];
    queryClient.setQueryData(["tasks"], initialTasks);

    const { result } = renderHook(() => useReorderTasks(), {
      wrapper: createWrapper(queryClient),
    });

    // Reorder: C, A, B
    result.current.mutate(["3", "1", "2"]);

    await waitFor(() => {
      const cached = queryClient.getQueryData<Partial<Task>[]>(["tasks"]);
      expect(cached?.[0]?.day_order).toBe(0); // Task C
      expect(cached?.[1]?.day_order).toBe(1); // Task A
      expect(cached?.[2]?.day_order).toBe(2); // Task B
    });
  });
});
