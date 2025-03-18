# Système de Notifications Push - Documentation

## Vue d'ensemble

Ce système permet d'envoyer des notifications push aux utilisateurs de l'application, même lorsqu'ils ne sont pas activement sur le site. Il utilise les technologies Web Push et Service Workers pour permettre la réception de notifications sur les appareils des utilisateurs.

## Composants du système

Le système de notifications se compose de plusieurs parties :

1. **API côté serveur** - Gère les abonnements et l'envoi des notifications
2. **Service Worker** - Reçoit les notifications et les affiche sur l'appareil
3. **Hook client** - Permet aux composants React de gérer les notifications
4. **Composant UI** - Interface utilisateur pour activer/désactiver les notifications

## Structure des fichiers

```
/api/notification/
├── push/
│   └── route.ts           # API pour envoyer des notifications
├── subscribe/
│   └── route.ts           # API pour s'abonner aux notifications
├── unsubscribe/
│   └── route.ts           # API pour se désabonner des notifications
└── README.md              # Cette documentation

/hooks/
└── useNotification.ts     # Hook React pour gérer les notifications

/lib/servicesWorker/
└── worker/
    └── index.ts           # Service Worker pour traiter les notifications

/types/
├── notificationContent.type.ts  # Types pour le contenu des notifications
└── api/
    └── notification.types.ts    # Types pour les API de notification
```

## Fonctionnement technique

### Processus d'abonnement

1. L'utilisateur clique sur "Activer les notifications"
2. Le navigateur demande la permission à l'utilisateur
3. Si autorisé, un nouveau "Push Subscription" est créé avec une paire de clés unique
4. Les détails de l'abonnement sont envoyés au serveur et stockés en base de données

### Processus d'envoi de notification

1. Une action déclenche l'envoi d'une notification (action utilisateur, événement programmé, etc.)
2. Le serveur récupère les abonnements cibles de la base de données
3. Pour chaque abonnement, le serveur :
   - Prépare le contenu de la notification
   - Chiffre le message avec les clés de l'abonnement
   - Envoie la notification au service push du navigateur

### Réception de notification

1. Le service push du navigateur reçoit la notification
2. Le service worker est réveillé avec un événement "push"
3. Le service worker traite le message et affiche la notification
4. L'utilisateur peut interagir avec la notification

## Points d'API

### POST /api/notification/push

Envoie une notification aux utilisateurs spécifiés.

```typescript
// Corps de la requête
{
  "title": "Titre de la notification",
  "message": "Contenu de la notification",
  "target": {
    "type": "user", // ou "role"
    "id": "123"     // ID de l'utilisateur ou du rôle
  },
  "data": {
    "path": "/chemin/de/redirection",
    "priority": "high"
  },
  "actions": [
    {
      "action": "open",
      "title": "Voir détails"
    }
  ]
}

// Réponse
{
  "success": true,
  "message": "2 notification(s) envoyée(s) avec succès",
  "sent": 2,
  "failed": 0,
  "total": 2
}
```

### POST /api/notification/subscribe

Enregistre un nouvel abonnement pour l'utilisateur.

```typescript
// Corps de la requête (généré par le navigateur)
{
  "endpoint": "https://example.com/api/push/...",
  "keys": {
    "p256dh": "BNcRd...",
    "auth": "tBHI..."
  }
}

// Réponse
{
  "success": true,
  "message": "Abonnement enregistré avec succès",
  "subscription": {
    "endpoint": "https://example.com/api/push/...",
    "p256dh": "BNcRd...",
    "auth": "tBHI..."
  }
}
```

### POST /api/notification/unsubscribe

Supprime un abonnement existant.

```typescript
// Corps de la requête
{
  "endpoint": "https://example.com/api/push/..."
}

// Réponse
{
  "success": true,
  "message": "Abonnement supprimé avec succès"
}
```

## Utilisation avec le hook React

```typescript
// Dans un composant React
import { useNotification } from "@/hooks/useNotification";

function NotificationToggle() {
  const { isSubscribed, isLoading, subscribe, unsubscribe } = useNotification();

  return (
    <button onClick={isSubscribed ? unsubscribe : subscribe}>
      {isSubscribed
        ? "Désactiver les notifications"
        : "Activer les notifications"}
    </button>
  );
}

// Pour envoyer une notification
function SendNotificationButton() {
  const { pushMessage } = useNotification();

  const handleClick = async () => {
    await pushMessage({
      title: "Nouveau message",
      message: "Vous avez reçu un message",
      target: { type: "user", id: "user123" },
      data: { path: "/messages/123" },
    });
  };

  return <button onClick={handleClick}>Envoyer notification</button>;
}
```

## Configuration requise

### Variables d'environnement

```
WEB_PUSH_EMAIL=email@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_cle_publique
VAPID_PRIVATE_KEY=votre_cle_privee
```

### Schéma de base de données (Prisma)

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Bonnes pratiques

1. Toujours vérifier les autorisations avant d'envoyer des notifications
2. Respecter les préférences de l'utilisateur concernant le type de notifications
3. Ne pas envoyer trop de notifications pour éviter de lasser l'utilisateur
4. Fournir des options claires pour se désabonner
5. Inclure des actions pertinentes dans les notifications
6. Ajouter des données contextuelles pour améliorer l'expérience utilisateur

## Sécurité

- Les clés VAPID protègent contre les attaques de spam
- Toutes les notifications sont chiffrées entre le serveur et l'utilisateur
- Les utilisateurs ne peuvent gérer que leurs propres abonnements
- L'authentification est requise pour toutes les opérations
