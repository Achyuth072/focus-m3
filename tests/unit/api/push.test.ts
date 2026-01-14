import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as subscribePOST } from "@/../app/api/push/subscribe/route";
import { POST as sendPOST } from "@/../app/api/push/send/route";
import { webpush } from "@/lib/push";

// Mock Supabase Server Client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn().mockReturnThis(),
  upsert: vi.fn(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  delete: vi.fn().mockReturnThis(),
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock web-push
vi.mock("@/lib/push", () => ({
  webpush: {
    sendNotification: vi.fn(),
  },
}));

describe("Push Notification API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VAPID_PRIVATE_KEY = "test-private-key";
    process.env.VAPID_SUBJECT = "mailto:test@example.com";
  });

  describe("POST /api/push/subscribe", () => {
    // Given: An authenticated user and a valid subscription
    // When:  The subscribe endpoint is called
    // Then:  It should save the subscription to the database
    it("TC-SUB-01: should save subscription for authenticated user", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });
      mockSupabase.upsert.mockResolvedValue({ error: null });

      const request = new Request("http://localhost/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify({
          subscription: { endpoint: "https://test.com" },
        }),
      });

      const response = await subscribePOST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: "user-123" }),
        { onConflict: "user_id" }
      );
    });

    // Given: A request without authentication
    // When:  The subscribe endpoint is called
    // Then:  It should return 401 Unauthorized
    it("TC-SUB-02: should return 401 for unauthenticated users", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request("http://localhost/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify({ subscription: {} }),
      });

      const response = await subscribePOST(request);
      expect(response.status).toBe(401);
    });

    // Given: A request with missing subscription data
    // When:  The subscribe endpoint is called
    // Then:  It should return 400 Bad Request
    it("TC-SUB-03: should return 400 when subscription is missing", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      const request = new Request("http://localhost/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await subscribePOST(request);
      expect(response.status).toBe(400);
    });

    // Given: A database error occurs
    // When:  The subscribe endpoint is called
    // Then:  It should return 500 Internal Server Error
    it("TC-SUB-04: should return 500 on database error", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });
      mockSupabase.upsert.mockResolvedValue({ error: { message: "DB Error" } });

      const request = new Request("http://localhost/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify({ subscription: { endpoint: "..." } }),
      });

      const response = await subscribePOST(request);
      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/push/send", () => {
    // Given: An authenticated user and a valid target user with a subscription
    // When:  The send endpoint is called
    // Then:  It should trigger a push notification via web-push
    it("TC-SND-01: should send notification to target user", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "sender-123" } },
      });
      mockSupabase.single.mockResolvedValue({
        data: { subscription: { endpoint: "https://test.com" } },
        error: null,
      });
      vi.mocked(webpush.sendNotification).mockResolvedValue({ statusCode: 200, headers: {}, body: "" });

      const request = new Request("http://localhost/api/push/send", {
        method: "POST",
        body: JSON.stringify({
          userId: "target-456",
          title: "Hello",
          body: "World",
        }),
      });

      const response = await sendPOST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(webpush.sendNotification).toHaveBeenCalled();
    });

    // Given: A target user who is not subscribed
    // When:  The send endpoint is called
    // Then:  It should return 404 Not Found
    it("TC-SND-02: should return 404 if subscriber not found", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "sender-123" } },
      });
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const request = new Request("http://localhost/api/push/send", {
        method: "POST",
        body: JSON.stringify({ userId: "missing-user" }),
      });

      const response = await sendPOST(request);
      expect(response.status).toBe(404);
    });

    // Given: A expired subscription (Web Push returns 410)
    // When:  The send endpoint is called
    // Then:  It should delete the subscription from DB and return 410
    it("TC-SND-03: should delete subscription if web-push returns 410", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "sender-123" } },
      });
      mockSupabase.single.mockResolvedValue({
        data: { subscription: { endpoint: "https://old.com" } },
        error: null,
      });

      const error410 = { statusCode: 410 };
      vi.mocked(webpush.sendNotification).mockRejectedValue(error410);

      const request = new Request("http://localhost/api/push/send", {
        method: "POST",
        body: JSON.stringify({ userId: "expired-user" }),
      });

      const response = await sendPOST(request);
      expect(response.status).toBe(410);
      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    // Given: VAPID private key is missing server-side
    // When:  The send endpoint is called
    // Then:  It should return 500 with a specific error message
    it("TC-SND-04: should return 500 if VAPID private key is missing", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "sender-123" } },
      });
      mockSupabase.single.mockResolvedValue({
        data: { subscription: { endpoint: "https://test.com" } },
        error: null,
      });

      // Mock missing env var
      const originalEnv = process.env;
      process.env = { ...originalEnv, VAPID_PRIVATE_KEY: "" };

      const request = new Request("http://localhost/api/push/send", {
        method: "POST",
        body: JSON.stringify({ userId: "target-456" }),
      });

      try {
        const response = await sendPOST(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("VAPID configuration missing");
      } finally {
        process.env = originalEnv;
      }
    });
  });
});
