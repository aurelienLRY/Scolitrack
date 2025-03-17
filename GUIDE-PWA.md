# Guide d'Implémentation PWA pour Next.js

Ce guide explique comment configurer, personnaliser et maintenir la Progressive Web App (PWA) dans notre projet Next.js.

## 1. Structure des Fichiers

```plaintext
src/
├── app/
│   ├── manifest.ts        # Métadonnées de la PWA
│   ├── layout.tsx         # Layout principal avec métadonnées
│   └── metadata.ts        # Configuration des métadonnées globales
├── components/
│   └── ui/
│       └── PWAInstallPrompt.tsx  # Composant d'installation
├── hooks/
│   └── usePWA.ts         # Hook de gestion PWA
├── config/
│   └── pwa.config.ts     # Configuration de la PWA
└── styles/
    └── globals.css       # Styles globaux

public/
├── manifest.json         # Manifeste de la PWA
├── sw.js                # Service Worker
└── icons/
    └── PWA/             # Icônes de la PWA
        ├── android/     # Icônes Android
        ├── ios/         # Icônes iOS
        └── windows/     # Icônes Windows
```

## 2. Configuration de Base

### Installation des Dépendances

```bash
npm install @ducanh2912/next-pwa  web-push
```

### Configuration Next.js (next.config.ts)

```typescript
import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
```

### Options de Configuration PWA

- `dest`: Dossier de destination pour les fichiers PWA (généralement "public")
- `register`: Active l'enregistrement automatique du service worker
- `skipWaiting`: Active la mise à jour immédiate du service worker
- `disable`: Désactive la PWA en développement pour éviter les problèmes de cache

## 3. Personnalisation

### Configuration PWA (src/config/pwa.config.ts)

```typescript
export const pwaConfig = {
  // Activer/désactiver la personnalisation
  customInstallPrompt: true,

  // Délai avant l'affichage (ms)
  promptDelay: 1000,

  // Nombre maximum d'invites
  maxPrompts: 2,

  // Intervalle entre les invites (heures)
  promptInterval: 24,

  // Messages personnalisés
  messages: {
    title: "Installer NextPerfect",
    description:
      "Installez notre application pour un accès rapide et hors ligne",
    installButton: "Installer",
    cancelButton: "Plus tard",
  },

  // Style
  style: {
    primaryColor: "#3b82f6",
    darkMode: true,
  },
};
```

### Métadonnées PWA (src/app/metadata.ts)

```typescript
export const metadata: Metadata = {
  title: "Next Perfect",
  description: "Description de l'application",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NextPerfect",
  },
  // ... autres métadonnées
};
```

## 4. Icônes Requises

Les icônes doivent être placées dans `/public/icons/PWA/` avec les tailles suivantes :

### Génération des Icônes

Pour générer facilement toutes les tailles d'icônes nécessaires, vous pouvez utiliser :
[PWA Image Generator](https://www.pwabuilder.com/imageGenerator)

1. Téléchargez une image source de haute qualité (idéalement 512x512 ou plus)
2. Utilisez le générateur en ligne
3. Téléchargez le package d'icônes généré
4. Placez les icônes dans les dossiers correspondants :

### Android

- 48x48
- 72x72
- 96x96
- 144x144
- 192x192
- 512x512

### iOS

- 120x120
- 152x152
- 167x167
- 180x180
- 192x192
- 512x512

### Windows

- 44x44
- 50x50
- 150x150

## 5. Personnalisation de l'Invite d'Installation

Le composant `PWAInstallPrompt` peut être personnalisé de plusieurs manières :

1. **Messages** : Modifiez les textes dans `pwa.config.ts`
2. **Style** : Ajustez les couleurs et le thème
3. **Timing** : Configurez le délai et la fréquence d'affichage
4. **Conditions** : Modifiez la logique dans `usePWA.ts`

## 6. Service Worker

Le service worker (`public/sw.js`) gère :

- La mise en cache des ressources
- Les stratégies de mise à jour
- Le fonctionnement hors ligne

Pour modifier le comportement du cache :

1. Ajoutez/modifiez les ressources à mettre en cache
2. Ajustez les stratégies de mise en cache
3. Personnalisez les réponses hors ligne

## 7. Tests et Débogage

Pour tester la PWA :

1. Construisez l'application : `npm run build`
2. Démarrez en production : `npm start`
3. Ouvrez Chrome DevTools > Application
4. Vérifiez :
   - Le manifeste
   - Le service worker
   - Le stockage
   - L'installation

## 8. Bonnes Pratiques

1. **Performance**

   - Optimisez les images
   - Minimisez les ressources mises en cache
   - Utilisez le composant Image de Next.js
   - Utilisez PWA Builder pour générer des icônes optimisées

2. **Maintenance**

   - Documentez les changements
   - Testez sur différents appareils
   - Mettez à jour les icônes si nécessaire
   - Conservez l'image source originale des icônes (512x512 ou plus)

3. **Sécurité**
   - Utilisez HTTPS
   - Validez les entrées utilisateur
   - Sécurisez les données sensibles

## 9. Notifications Push

### Configuration des Notifications

Pour activer les notifications push dans votre PWA, vous devez :

1. Générer des clés VAPID pour l'authentification
2. Configurer le service worker pour recevoir les notifications
3. Implémenter un système d'abonnement côté client
4. Stocker les abonnements dans une base de données
5. Créer une API pour envoyer des notifications

### Génération des Clés VAPID

```bash
npx web-push generate-vapid-keys
```

Ajoutez les clés à votre fichier `.env.local` :

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_clé_publique
VAPID_PRIVATE_KEY=votre_clé_privée
WEB_PUSH_EMAIL=votre_email@exemple.com
```

### Service Worker pour les Notifications

Créez un fichier `public/notification-worker.js` pour gérer les notifications push :

```javascript
self.addEventListener("push", function (event) {
  const options = {
    body: event.data.text(),
    icon: "/icons/PWA/android/android-launchericon-144-144.png",
    badge: "/icons/PWA/android/android-launchericon-48-48.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Voir plus",
      },
      {
        action: "close",
        title: "Fermer",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Scolitrack", options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/private/dashboard"));
  }
});
```

### Hook useNotification

Créez un hook personnalisé pour gérer les notifications côté client :

```typescript
// src/hooks/useNotification.ts
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

type PushSubscriptionJSON = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export const useNotification = () => {
  const [subscription, setSubscription] = useState<PushSubscriptionJSON | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      checkSubscription();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        setSubscription(sub.toJSON());
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'abonnement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const subscriptionData = sub.toJSON();
      setSubscription(subscriptionData);
      setIsSubscribed(true);

      await fetch("/api/notification/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      });

      toast.success("Notifications activées");
    } catch (error) {
      console.error("Erreur lors de l'abonnement:", error);
      toast.error("Erreur lors de l'activation des notifications");
    }
  };

  const unsubscribe = async () => {
    try {
      if (!subscription) return;

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);

        await fetch("/api/notification/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        });

        toast.success("Notifications désactivées");
      }
    } catch (error) {
      console.error("Erreur lors de la désinscription:", error);
      toast.error("Erreur lors de la désactivation des notifications");
    }
  };

  return {
    subscription,
    isLoading,
    isSubscribed,
    subscribe,
    unsubscribe,
  };
};
```

### Composant UI pour les Notifications

Créez un composant pour gérer l'interface utilisateur des notifications :

```typescript
// src/components/notification/NotificationToggle.tsx
import { Button } from "@/components/shared/button";
import { BsBell, BsBellSlash } from "react-icons/bs";
import { useNotification } from "@/hooks/useNotification";

export const NotificationToggle = () => {
  const { isSubscribed, isLoading, subscribe, unsubscribe } = useNotification();

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <BsBell className="h-5 w-5 animate-pulse" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={isSubscribed ? unsubscribe : subscribe}
      title={
        isSubscribed
          ? "Désactiver les notifications"
          : "Activer les notifications"
      }
    >
      {isSubscribed ? (
        <BsBell className="h-5 w-5 text-primary" />
      ) : (
        <BsBellSlash className="h-5 w-5 text-muted-foreground" />
      )}
    </Button>
  );
};
```

### API Routes pour les Notifications

#### Route d'Abonnement

```typescript
// src/app/api/notification/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const subscription = await req.json();

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        { error: "Données d'abonnement invalides" },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'abonnement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const subscription = await req.json();

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Endpoint manquant" }, { status: 400 });
    }

    await prisma.pushSubscription.delete({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'abonnement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

#### Route d'Envoi de Notifications

```typescript
// src/app/api/notification/push/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

webpush.setVapidDetails(
  `mailto:${process.env.WEB_PUSH_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { title, message, userId } = await req.json();

    if (!title || !message || !userId) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (!subscriptions.length) {
      return NextResponse.json(
        { error: "Aucun abonnement trouvé" },
        { status: 404 }
      );
    }

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
          JSON.stringify({
            title,
            message,
            icon: "/icons/PWA/android/android-launchericon-144-144.png",
          })
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
```

### Schéma Prisma pour les Notifications

```prisma
// prisma/schema.prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, endpoint], name: "userId_endpoint")
}
```

### Utilisation

1. Ajoutez le composant `NotificationToggle` dans votre interface utilisateur
2. Utilisez le hook `useNotification` pour gérer les notifications
3. Envoyez des notifications via l'API `/api/notification/push`

### Notes Importantes

- Assurez-vous que votre application est servie en HTTPS
- Testez les notifications sur différents navigateurs et appareils
- Gérez correctement les erreurs et les cas où les abonnements ne sont plus valides
- Respectez les bonnes pratiques en matière de notifications (fréquence, pertinence, etc.)
