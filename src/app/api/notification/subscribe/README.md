# API d'Abonnement aux Notifications Push

## Aperçu

Cette API permet aux utilisateurs de s'abonner aux notifications push de l'application. Elle enregistre les informations d'abonnement dans la base de données pour permettre l'envoi ultérieur de notifications ciblées.

## Structure

```
subscribe/
├── route.ts       # Point d'entrée de l'API
└── README.md      # Documentation (ce fichier)
```

## Fonctionnement

L'API `/api/subscribe` accepte des requêtes POST contenant les informations d'abonnement générées par le navigateur. Ces informations sont ensuite stockées dans la base de données, associées à l'utilisateur authentifié.

### Prérequis

1. Clé VAPID publique configurée dans les variables d'environnement :

   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

2. Un système d'authentification fonctionnel (comme NextAuth.js)

3. Une base de données pour stocker les abonnements

4. Un service worker enregistré côté client

## Utilisation

### Abonnement côté client

```typescript
// Exemple d'utilisation côté client
async function subscribeToNotifications() {
  try {
    // 1. Vérifier si le service worker est disponible
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      throw new Error(
        "Les notifications push ne sont pas supportées par ce navigateur"
      );
    }

    // 2. Demander la permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Permission refusée");
    }

    // 3. Enregistrer le service worker (s'il n'est pas déjà enregistré)
    const registration = await navigator.serviceWorker.ready;

    // 4. S'abonner au service de push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    // 5. Envoyer l'abonnement au serveur
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    const data = await response.json();

    if (data.success) {
      console.log("Abonnement aux notifications réussi");
      return true;
    } else {
      throw new Error(data.error || "Échec de l'abonnement");
    }
  } catch (error) {
    console.error("Erreur lors de l'abonnement:", error);
    return false;
  }
}
```

### Format de la requête

L'objet d'abonnement envoyé au serveur est généré par le navigateur et ressemble à ceci :

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "expirationTime": null,
  "keys": {
    "p256dh": "BNn/...",
    "auth": "tBHI..."
  }
}
```

### Format de la réponse

```json
{
  "success": true
}
```

Ou en cas d'erreur :

```json
{
  "success": false,
  "error": "Message d'erreur"
}
```

## Implémentation côté serveur

Voici un exemple d'implémentation de l'API côté serveur :

```typescript
// src/app/api/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Non authentifié",
        },
        { status: 401 }
      );
    }

    const subscription = await req.json();

    // Valider la subscription
    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Données d'abonnement invalides",
        },
        { status: 400 }
      );
    }

    // Stocker ou mettre à jour l'abonnement
    await db.subscription.upsert({
      where: {
        userIdAndEndpoint: {
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
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
      },
      { status: 500 }
    );
  }
}
```

## Désabonnement

Pour permettre aux utilisateurs de se désabonner, vous pouvez implémenter une route supplémentaire :

```typescript
// Côté client
async function unsubscribeFromNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Désabonner côté navigateur
      await subscription.unsubscribe();

      // Informer le serveur
      await fetch("/api/subscribe", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error("Erreur lors du désabonnement:", error);
    return false;
  }
}
```

## Sécurité

- Assurez-vous que l'utilisateur est authentifié avant d'enregistrer un abonnement
- Validez toujours les données d'abonnement reçues
- Stockez les informations d'abonnement de manière sécurisée
- Implémentez une logique de nettoyage pour les abonnements expirés

## Dépannage

### Problèmes courants

1. **Erreur "Permission refusée"**

   - L'utilisateur a refusé les notifications dans son navigateur
   - Solution : Expliquer à l'utilisateur pourquoi les notifications sont utiles et comment les activer

2. **Abonnement non enregistré**

   - Vérifiez que l'utilisateur est bien authentifié
   - Assurez-vous que le service worker est correctement enregistré
   - Vérifiez que la clé VAPID publique est correcte

3. **Erreurs de base de données**
   - Vérifiez la structure de votre base de données
   - Assurez-vous que les contraintes d'unicité sont correctement définies
