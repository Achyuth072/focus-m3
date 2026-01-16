"use client";

import {
  Bell,
  BellOff,
  Globe,
  Coffee,
  Moon,
  Calendar,
  Clock,
  Timer,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { useProfile } from "@/lib/hooks/useProfile";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { sendPushNotification } from "@/lib/push-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";

const getInitialTimezones = () => {
  if (typeof window === "undefined")
    return ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"];
  try {
    return (Intl as unknown as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf("timeZone");
  } catch {
    return ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"];
  }
};

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    notificationsEnabled,
    isSyncing,
    requestPermission,
    unsubscribe,
  } = usePushNotifications();
  const { isGuestMode } = useAuth();
  const { profile, updateProfile, updateSettings } = useProfile();
  const { trigger } = useHaptic();

  const [timezones] = useState<string[]>(getInitialTimezones);
  const [timezoneSearch, setTimezoneSearch] = useState("");

  // Get UTC offset for a timezone
  const getTimezoneOffset = (timezone: string): string => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "shortOffset",
      });
      const parts = formatter.formatToParts(now);
      const offset = parts.find((p) => p.type === "timeZoneName")?.value || "";
      return offset.replace("GMT", "UTC");
    } catch {
      return "";
    }
  };

  // Filter timezones based on search
  const filteredTimezones = useMemo(() => {
    if (!timezoneSearch) return timezones;
    const search = timezoneSearch.toLowerCase();

    return timezones.filter((tz) => {
      const normalizedTz = tz
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\//g, " ");
      const offset = getTimezoneOffset(tz).toLowerCase();
      return (
        normalizedTz.includes(search) ||
        offset.includes(search) ||
        tz.toLowerCase().includes(search)
      );
    });
  }, [timezones, timezoneSearch]);

  const handleTogglePush = async (checked: boolean) => {
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
      } else if (result === "denied") {
        toast.error("Permission denied. Enable in browser settings.");
      }
    } else {
      await unsubscribe();
      toast.success("Notifications disabled");
    }
  };

  const updateNotifySetting = async (key: string, checked: boolean) => {
    trigger(10);
    try {
      await updateSettings.mutateAsync({
        notifications: {
          ...profile?.settings?.notifications,
          [key]: checked,
        },
      } as Parameters<typeof updateSettings.mutateAsync>[0]);
    } catch {
      toast.error("Failed to update settings");
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
      toast.success("Test notification sent");
    } catch {
      toast.error("Failed to send test notification");
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

  const settings = profile?.settings?.notifications;

  return (
    <div className="space-y-6">
      {/* 1. Master Toggle */}
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
                  : "Enable to receive updates"}
              </p>
            </div>
          </div>
          <Switch
            checked={notificationsEnabled && permission === "granted"}
            onCheckedChange={handleTogglePush}
            disabled={permission === "denied" || isSyncing}
            aria-label="Push Notifications"
          />
        </div>

        {permission === "granted" && notificationsEnabled && !isSyncing && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleTestNotification}
          >
            <Bell className="h-4 w-4 mr-2" />
            Send Test Notification
          </Button>
        )}
      </div>

      {/* 2. Timezone Selection */}
      {!isGuestMode && (
        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Local Time
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              Confirm your timezone to ensure morning briefings and task alerts
              arrive at the right local time.
            </p>
            <Select
              value={profile?.timezone || "UTC"}
              onValueChange={(val) => {
                trigger(15);
                updateProfile.mutate({ timezone: val });
                setTimezoneSearch(""); // Clear search on selection
              }}
            >
              <SelectTrigger
                className="w-full max-w-[320px]"
                aria-label="Select Timezone"
              >
                <SelectValue placeholder="Select Timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] w-[--radix-select-trigger-width] min-w-[320px]">
                <div className="sticky top-0 z-10 bg-popover px-2 py-2 border-b border-border/50">
                  <input
                    type="text"
                    placeholder="Search timezone..."
                    value={timezoneSearch}
                    onChange={(e) => setTimezoneSearch(e.target.value)}
                    onKeyDown={(e) => {
                      // Prevent Radix Select from intercepting key events
                      e.stopPropagation();
                    }}
                    className="w-full px-3 py-1.5 text-sm bg-background border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div className="overflow-y-auto max-h-[240px]">
                  {filteredTimezones.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No timezone found
                    </div>
                  ) : (
                    filteredTimezones.map((tz) => {
                      const offset = getTimezoneOffset(tz);
                      return (
                        <SelectItem key={tz} value={tz}>
                          <div className="flex items-center justify-between gap-3 w-full">
                            <span className="truncate">
                              {tz.replace(/_/g, " ")}
                            </span>
                            {offset && (
                              <span className="text-xs text-muted-foreground font-mono shrink-0">
                                {offset}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* 3. Detailed Schedules */}
      {permission === "granted" && notificationsEnabled && !isGuestMode && (
        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Schedules
            </h3>
          </div>

          <div className="space-y-2">
            {/* Morning Briefing */}
            <ScheduleToggle
              icon={Coffee}
              title="Morning Briefing"
              description="Daily summary at 8:00 AM"
              checked={settings?.morning_briefing ?? true}
              onChange={(c) => updateNotifySetting("morning_briefing", c)}
            />

            {/* Evening Plan */}
            <ScheduleToggle
              icon={Moon}
              title="Evening Plan"
              description="Review tonight's tasks at 6:00 PM"
              checked={settings?.evening_plan ?? true}
              onChange={(c) => updateNotifySetting("evening_plan", c)}
            />

            {/* Smart Alerts */}
            <ScheduleToggle
              icon={Calendar}
              title="Due Date Alerts"
              description="When a task reaches its deadline"
              checked={settings?.due_date_alerts ?? true}
              onChange={(c) => updateNotifySetting("due_date_alerts", c)}
            />

            <ScheduleToggle
              icon={Timer}
              title="Timer Completion"
              description="When your focus or break ends"
              checked={settings?.timer_alerts ?? true}
              onChange={(c) => updateNotifySetting("timer_alerts", c)}
            />
          </div>
        </div>
      )}

      {isGuestMode && permission === "granted" && (
        <p className="text-xs text-center text-muted-foreground italic px-2">
          Morning briefings and server-side alerts require a synced account.
        </p>
      )}
    </div>
  );
}

function ScheduleToggle({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md border border-border/30 bg-muted/20">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </div>
  );
}
