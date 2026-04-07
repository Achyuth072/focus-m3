import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  uploadWebDavBackup,
  downloadWebDavBackup,
  testWebDavConnection,
} from "@/lib/backup/webdav-sync";

// Mock tsdav
vi.mock("tsdav", () => ({
  createDAVClient: vi.fn(),
}));

describe("webdav-sync", () => {
  const mockCredentials = {
    serverUrl: "https://dav.example.com/remote.php/dav/files/user",
    username: "testuser",
    password: "testpass",
  };

  describe("testWebDavConnection", () => {
    it("returns success for valid credentials", async () => {
      const { createDAVClient } = await import("tsdav");
      (createDAVClient as any).mockResolvedValueOnce({
        fetchPrincipalUrl: vi
          .fn()
          .mockResolvedValue("https://dav.example.com/principals/user"),
      });

      const result = await testWebDavConnection(mockCredentials);
      expect(result.success).toBe(true);
    });

    it("returns error for invalid credentials", async () => {
      const { createDAVClient } = await import("tsdav");
      (createDAVClient as any).mockRejectedValueOnce(
        new Error("401 Unauthorized"),
      );

      const result = await testWebDavConnection(mockCredentials);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid username or password");
    });
  });

  describe("uploadWebDavBackup", () => {
    it("uploads JSON to the correct path", async () => {
      const mockCreateObject = vi.fn().mockResolvedValue({});
      const { createDAVClient } = await import("tsdav");
      (createDAVClient as any).mockResolvedValueOnce({
        createObject: mockCreateObject,
      });

      await uploadWebDavBackup(mockCredentials, '{"test": true}');

      expect(mockCreateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("kanso-backup.json"),
          data: '{"test": true}',
          contentType: "application/json",
        }),
      );
    });
  });
});
