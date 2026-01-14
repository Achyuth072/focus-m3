"use client";

import { useState, useEffect, useCallback } from "react";
import { useUiStore } from "@/lib/store/uiStore";
import { syncPushSubscription } from "@/lib/push-api";

export type NotificationPermission = "default" | "granted" | "denied";

export function usePushNotifications() {
  const { notificationsEnabled, setNotificationsEnabled } = useUiStore();
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === "undefined") return "default";
    return (Notification.permission as NotificationPermission) || "default";
  });
  const [isSupported] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    );
  });
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isSyncing, setIsSyncing] = useState(false);

  // Helper to wait for service worker with timeout
  const getServiceWorkerRegistration = useCallback(async () => {
    const swPromise = navigator.serviceWorker.ready;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Service worker registration timeout")),
        5000
      )
    );
    return Promise.race([swPromise, timeoutPromise]);
  }, []);

  const sendSubscriptionToBackend = useCallback(
    async (sub: PushSubscription) => {
      try {
        await syncPushSubscription(sub);
      } catch (error) {
        console.error("Error sending subscription to backend:", error);
      }
    },
    []
  );

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return "denied";
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);

      if (result === "granted") {
        // Note: subscribeToPush now handles setNotificationsEnabled(true) on success
        await subscribeToPush(result as NotificationPermission);
      }

      return result as NotificationPermission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  };

  const subscribeToPush = useCallback(
    async (
      permissionOverride?: NotificationPermission
    ): Promise<PushSubscription | null> => {
      const effectivePermission = permissionOverride || permission;
      if (!isSupported || effectivePermission !== "granted") {
        return null;
      }

      try {
        setIsSyncing(true);
        const registration = await getServiceWorkerRegistration();

        let sub = await registration.pushManager.getSubscription();

        if (!sub) {
          const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

          if (!vapidPublicKey) {
            console.error("VAPID public key not configured");
            return null;
          }

          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
          });
        }

        setSubscription(sub);
        await sendSubscriptionToBackend(sub);

        // Finally enable notifications in store only after everything is synced
        setNotificationsEnabled(true);

        return sub;
      } catch (error) {
        console.error("Error subscribing to push notifications:", error);
        return null;
      } finally {
        setIsSyncing(false);
      }
    },
    [
      isSupported,
      permission,
      sendSubscriptionToBackend,
      getServiceWorkerRegistration,
      setNotificationsEnabled,
    ]
  );

  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) {
      setNotificationsEnabled(false);
      return true;
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setNotificationsEnabled(false);
      return true;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      return false;
    }
  };

  const showNotification = async (
    title: string,
    options?: NotificationOptions
  ): Promise<void> => {
    if (!isSupported || permission !== "granted") {
      return;
    }

    try {
      const registration = await getServiceWorkerRegistration();
      await registration.showNotification(title, {
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        vibrate: [200, 100, 200],
        ...options,
      } as any);
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  };

  useEffect(() => {
    if (isSupported && notificationsEnabled) {
      const initSubscription = async () => {
        try {
          const registration = await getServiceWorkerRegistration();
          const sub = await registration.pushManager.getSubscription();
          if (sub) {
            setSubscription(sub);
            await sendSubscriptionToBackend(sub);
          } else if (permission === "granted") {
            await subscribeToPush();
          }
        } catch (error) {
          console.error("Error initializing push subscription:", error);
        }
      };
      initSubscription();
    }
  }, [
    isSupported,
    notificationsEnabled,
    permission,
    sendSubscriptionToBackend,
    subscribeToPush,
  ]);

  return {
    isSupported,
    permission,
    notificationsEnabled,
    subscription,
    isSyncing,
    requestPermission,
    subscribeToPush,
    unsubscribe,
    showNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
