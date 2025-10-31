import { useEffect } from "react";
import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { getMessagingIfSupported, VAPID_PUBLIC_KEY } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";
import { scheduleDailyPrompts, showTestNotification } from "@/lib/notifications";

export function useFCM() {
  useEffect(() => {
    let unsub: (() => void) | null = null;

    const setup = async () => {
      try {
        const messaging = await getMessagingIfSupported();
        if (!messaging) return;

        // Register firebase messaging service worker if not already
        if ("serviceWorker" in navigator) {
          try {
            await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          } catch (_) {
            // ignore
          }
        }

        // Request permission and get token
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const token = await getToken(messaging, {
          vapidKey: VAPID_PUBLIC_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.getRegistration(),
        });

        if (token) {
          // For now, log it. You can send this to your backend later.
          console.info("FCM token:", token);
          localStorage.setItem("fcmToken", token);
        }

        // Foreground message handler
        unsub = onMessage(messaging, (payload: MessagePayload) => {
          const title = payload.notification?.title ?? "Notification";
          const body = payload.notification?.body ?? "";
          toast({ title, description: body });
        });

        // Schedule local daily prompts at 7 AM, 12 PM, 6 PM
        scheduleDailyPrompts();

        // Show a one-time confirmation notification after enabling
        const shownKey = "fcmTestShown";
        if (!localStorage.getItem(shownKey)) {
          await showTestNotification();
          localStorage.setItem(shownKey, "1");
        }

        // Expose a quick test helper in console: window.bhaktiNotifyTest()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).bhaktiNotifyTest = showTestNotification;
      } catch (err) {
        console.warn("FCM setup error", err);
      }
    };

    setup();

    return () => {
      if (unsub) unsub();
    };
  }, []);
}


