import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useProfile } from "@/lib/hooks/useProfile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock Supabase
const mockQuery = {
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  then: vi.fn((resolve) => resolve({ data: null, error: null })),
};

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(() => mockQuery),
  }),
}));

const mockAuthValue = {
  user: { id: "test-user-123" },
  isGuestMode: false,
};

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => mockAuthValue,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.select.mockReturnThis();
    mockQuery.update.mockReturnThis();
    mockQuery.eq.mockReturnThis();
  });

  it("TC-PR-01: should fetch profile with settings", async () => {
    mockQuery.single.mockResolvedValue({
      data: {
        id: "test-user-123",
        timezone: "Asia/Tokyo",
        settings: { notifications: { morning_briefing: false } },
      },
      error: null,
    });

    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.profile?.id).toBe("test-user-123");
    expect(result.current.profile?.timezone).toBe("Asia/Tokyo");
  });

  it("TC-PR-02: should handle guest mode", async () => {
    mockAuthValue.isGuestMode = true;
    mockAuthValue.user = null;

    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(),
    });
    expect(result.current.profile).toBeNull();
    expect(mockQuery.from).not.toHaveBeenCalled();
  });
});
