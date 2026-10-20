import webpush from "web-push";
import { prisma } from "@/lib/prisma/prisma";
import {
  DEFAULT_ICONS,
  DEFAULT_VIBRATE_PATTERN,
} from "@/config/notification.constants";
import { PrivilegeName } from "@/config/privileges.config";

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return;
  const email = process.env.WEB_PUSH_EMAIL;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!email || !publicKey || !privateKey) {
    throw new Error(
      "Web Push non configuré (WEB_PUSH_EMAIL, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)"
    );
  }
  webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
  vapidConfigured = true;
}

export type WebPushPayload = {
  title: string;
  message: string;
  path?: string;
  icon?: string;
  badge?: string;
  vibrate?: number[];
  data?: Record<string, unknown>;
};

export type WebPushSendResult = {
  sent: number;
  failed: number;
  total: number;
  deleted: number;
  errors?: Array<{ endpoint: string; error: string; subscriptionId: string }>;
};

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

async function sendToSubscriptions(
  subscriptions: SubscriptionRow[],
  payload: WebPushPayload
): Promise<WebPushSendResult> {
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0, total: 0, deleted: 0 };
  }

  ensureVapid();

  const notificationOptions = {
    title: payload.title,
    message: payload.message,
    icon: payload.icon || DEFAULT_ICONS.ICON,
    badge: payload.badge || DEFAULT_ICONS.BADGE,
    vibrate: payload.vibrate || DEFAULT_VIBRATE_PATTERN,
    data: {
      ...(payload.data || {}),
      path: payload.path || payload.data?.path || "/",
      timestamp: Date.now(),
    },
  };

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(notificationOptions)
      )
    )
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  const invalidIds: string[] = [];
  const errors: WebPushSendResult["errors"] = [];

  results.forEach((r, idx) => {
    if (r.status !== "rejected") return;
    const subscription = subscriptions[idx];
    const errorMessage =
      r.reason instanceof Error ? r.reason.message : String(r.reason);

    if (
      /404|410|invalid|expired|unsubscribed|unexpected response|not found|gone/i.test(
        errorMessage
      )
    ) {
      invalidIds.push(subscription.id);
    }

    errors.push({
      endpoint: subscription.endpoint,
      error: errorMessage,
      subscriptionId: subscription.id,
    });
  });

  let deleted = 0;
  if (invalidIds.length > 0) {
    try {
      const deleteResult = await prisma.pushSubscription.deleteMany({
        where: { id: { in: invalidIds } },
      });
      deleted = deleteResult.count;
    } catch (err) {
      console.error("Suppression abonnements push invalides:", err);
    }
  }

  return {
    sent: succeeded,
    failed,
    total: subscriptions.length,
    deleted,
    ...(errors.length > 0 ? { errors } : {}),
  };
}

/**
 * Envoie une notification push aux abonnements des userIds donnés.
 */
export async function sendWebPushToUserIds(
  userIds: string[],
  payload: WebPushPayload
): Promise<WebPushSendResult> {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) {
    return { sent: 0, failed: 0, total: 0, deleted: 0 };
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: { in: unique } },
  });

  return sendToSubscriptions(subscriptions, payload);
}

/**
 * Envoie une notification push à tous les utilisateurs d'un rôle (roleName).
 */
export async function sendWebPushToRole(
  roleName: string,
  payload: WebPushPayload
): Promise<WebPushSendResult> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { user: { roleName } },
  });
  return sendToSubscriptions(subscriptions, payload);
}

/**
 * Utilisateurs ayant un privilège donné (via leur rôle), y compris SUPER_ADMIN.
 */
export async function findUserIdsWithPrivilege(
  privilegeName: PrivilegeName | string
): Promise<Array<{ id: string; email: string; name: string | null }>> {
  return prisma.user.findMany({
    where: {
      OR: [
        { roleName: "SUPER_ADMIN" },
        {
          role: {
            rolePrivileges: {
              some: { privilege: { name: privilegeName } },
            },
          },
        },
      ],
    },
    select: { id: true, email: true, name: true },
  });
}

/**
 * Push vers tous les abonnés ayant le privilège (ex. MANAGE_ENROLLMENTS).
 */
export async function sendWebPushToPrivilege(
  privilegeName: PrivilegeName | string,
  payload: WebPushPayload
): Promise<WebPushSendResult> {
  const users = await findUserIdsWithPrivilege(privilegeName);
  return sendWebPushToUserIds(
    users.map((u) => u.id),
    payload
  );
}
