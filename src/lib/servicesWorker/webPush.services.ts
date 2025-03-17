"use server";
import webpush, { PushSubscription } from "web-push";
import { NotificationContent } from "@/types/notificationContent.type";

webpush.setVapidDetails(
  `mailto:${process.env.WEB_PUSH_EMAIL}`!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

/**
 * Send a notification to a user
 * @param sub - The subscription of the user
 * @param notification - The notification to send
 * @returns { success: boolean }
 */
export async function sendNotification(
  sub: PushSubscription,
  notification: NotificationContent
) {
  try {
    const icon =
      typeof notification.icon === "string"
        ? notification.icon
        : "/icons/PWA/android/android-launchericon-144-144.png";

    await webpush.sendNotification(
      sub,
      JSON.stringify({
        title: notification.title,
        message: notification.message,
        icon,
      })
    );

    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
