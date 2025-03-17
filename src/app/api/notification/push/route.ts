import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

webpush.setVapidDetails(
  `mailto:${process.env.WEB_PUSH_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);


/**
 * Route pour envoyer une notification à un utilisateur ou un rôle
 * @param req - Requête HTTP (json avec les données de la notification )
 * @returns Réponse HTTP
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { title, message, target, data, icon, badge, vibrate, actions } =
      await req.json();
    console.log("target", target);

    if (!title || !message || !target) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Récupérer les souscriptions en fonction du type de cible
    let subscriptions;
    if (target.type === "user") {
      subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: target.id },
      });
    } else if (target.type === "role") {
      subscriptions = await prisma.pushSubscription.findMany({
        where: {
          user: {
            role: target.id,
          },
        },
      });
    } else {
      return NextResponse.json(
        { error: "Type de cible invalide" },
        { status: 400 }
      );
    }

    if (!subscriptions.length) {
      return NextResponse.json(
        { error: "Aucun abonnement trouvé" },
        { status: 404 }
      );
    }

    console.log("subscriptions", subscriptions);

    // Préparer les options de notification
    const notificationOptions = {
      title,
      message,
      renotify: true,
      requireInteraction: true,
      lang: "fr",
      icon: icon || "/icons/PWA/android/android-launchericon-144-144.png",
      badge: badge || "/icons/PWA/android/android-launchericon-48-48.png",
      vibrate: vibrate || [200, 100, 200],
      ...(data && {
        data: {
          ...data,
          dateOfArrival: Date.now(),
          primaryKey: 1,
        },
      }),

      actions: actions || [
        {
          action: "open",
          title: "Ouvrir",

        },
        {
          action: "close",
          title: "Fermer",
        },
      ],
    };

    // Envoyer les notifications
    const results = await Promise.allSettled(
      subscriptions.map((sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        return webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notificationOptions)
        );
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      sent: succeeded,
      failed,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi des notifications:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
