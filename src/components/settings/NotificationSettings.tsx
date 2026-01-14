"use client";

import { Bell, BellOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { toast } from "sonner";
import { sendPushNotification } from "@/lib/push-api";
import { cn } from "@/lib/utils";

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    notificationsEnabled,
    isSyncing,
    requestPermission,
    unsubscribe,
    showNotification,
  } = usePushNotifications();
  const { trigger } = useHaptic();

  const handleToggle = async (checked: boolean) => {
    if (isSyncing) return;
    trigger(15);

    if (!isSupported) {
      toast.error("Push notifications are not supported in this browser");
      return;
    }

    if (checked) {
      const result = await requestPermission();

      if (result === "granted") {
        toast.success("Notifications enabled");

        await showNotification("Notifications Enabled", {
          body: "You&apos;ll now receive updates from Kanso",
        });
      } else if (result === "denied") {
        toast.error(
          "Notification permission denied. Please enable in browser settings."
        );
      }
    } else {
      await unsubscribe();
      toast.success("Notifications disabled");
    }
  };

  const handleTestNotification = async () => {
    trigger(15);

    if (permission !== "granted") {
      toast.error("Please enable notifications first");
      return;
    }

    try {
      await sendPushNotification({
        title: "Test Notification",
        body: "This is a server-sent test notification from Kanso",
        data: { type: "test" },
      });

      toast.success("Test notification sent from server");
    } catch (error: unknown) {
      console.error("Test notification error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send test notification";
      toast.error(errorMessage);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
        <div className="flex items-center gap-3 mb-2">
          <BellOff className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Notifications Not Supported
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Your browser doesn&apos;t support push notifications
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-secondary/30">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Push Notifications</p>
            <p className="text-xs text-muted-foreground">
              {permission === "granted"
                ? "Receive updates and reminders"
                : permission === "denied"
                ? "Permission denied"
                : "Enable to receive updates"}
            </p>
          </div>
        </div>
        <Switch
          checked={notificationsEnabled && permission === "granted"}
          onCheckedChange={handleToggle}
          disabled={permission === "denied" || isSyncing}
        />
      </div>

      {permission === "granted" && notificationsEnabled && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleTestNotification}
          disabled={isSyncing}
        >
          <Bell className={cn("h-4 w-4 mr-2", isSyncing && "animate-pulse")} />
          {isSyncing ? "Syncing..." : "Send Test Notification"}
        </Button>
      )}

      {permission === "denied" && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-muted-foreground">
            Notifications are blocked. Please enable them in your browser
            settings.
          </p>
        </div>
      )}
    </div>
  );
}
