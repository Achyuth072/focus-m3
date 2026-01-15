import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useProfile } from "../../src/lib/hooks/useProfile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

vi.mock("../../src/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  }),
}));

vi.mock("../../src/components/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "test" },
    isGuestMode: false,
  }),
}));

describe("useProfile render test", () => {
  it("should render", () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: any) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useProfile(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
