# Guide d'Implémentation et d'Utilisation PWA pour Scolitrack

Ce guide explique comment utiliser et étendre les fonctionnalités PWA déjà configurées dans le projet Scolitrack.

## 1. Structure des Fichiers

```plaintext
src/

├── app/

│   ├── manifest.ts        # Métadonnées de la PWA

│   ├── layout.tsx         # Layout principal avec métadonnées

│   └── metadata.ts        # Configuration des métadonnées globales

├── components/

│   ├── ui/

│   │   └── PWAInstallPrompt.tsx  # Composant d'installation

│   └── notification/

│       └── NotificationToggle.tsx # Toggle pour activer/désactiver les notifications

├── hooks/

│   └── useNotification.ts # Hook de gestion des notifications

├── config/

│   ├── app.config.ts      # Configuration générale de l'application

│   ├── pwa.config.ts      # Configuration de la PWA

│   └── notification.constants.ts # Constantes pour les notifications

├── lib/

│   └── servicesWorker/

│       ├── index.ts       # Configuration du service worker principal

│       └── webPush.services.ts # Services pour les notifications push

├── types/

│   └── notification.type.ts # Types pour les notifications

└── app/

    └── api/

        └── notification/  # API pour les notifications

            ├── push/      # Envoi de notifications

            ├── subscribe/ # Abonnement aux notifications

            └── unsubscribe/ # Désabonnement



public/

├── sw.js                # Service Worker généré au build

└── icons/

    └── PWA/             # Icônes de la PWA

        ├── android/     # Icônes Android

        ├── ios/         # Icônes iOS

        └── windows/     # Icônes Windows
```

## 2. Configuration Existante

La PWA est déjà configurée avec les fonctionnalités suivantes :

### Configuration de Base (next.config.js)

Le projet utilise `@ducanh2912/next-pwa` pour générer automatiquement le service worker au moment du build. La configuration se trouve dans `next.config.js`.

### Fichiers de Configuration

1. **app.config.ts**

   - Contient la configuration générale de l'application
   - Définit le nom, la description, les couleurs, etc.
   - Définit la portée (`scope`) et les comportements de l'application

2. **pwa.config.ts**

   - Configure les options spécifiques à la PWA
   - Paramètres de l'invite d'installation
   - Comportements de mise en cache

3. **notification.constants.ts**

   - Définit les constantes utilisées pour les notifications
   - Contient les valeurs par défaut pour les icônes, vibrations, etc.

## 3. Service Worker

### Comment fonctionne le Service Worker

Le service worker est configuré dans `src/lib/servicesWorker/index.ts` mais est **automatiquement généré** en tant que `sw.js` lors du build. Il gère :

- La mise en cache des ressources 
- Les stratégies de mise à jour 
- Le fonctionnement hors ligne 
- La réception et l'affichage des notifications push

### Comment personnaliser le Service Worker

Pour modifier le comportement du service worker :

1. **Ne modifiez pas directement `public/sw.js`** - Il est généré automatiquement.
  
2. Modifiez plutôt les configurations dans :
  

   - `src/lib/servicesWorker/index.ts` - Pour la gestion des notifications

   - `next.config.js` - Pour les stratégies de mise en cache

## 4. Notifications Push

### Composants et Hooks disponibles

1. **Hook `useNotification`**

   Le hook `useNotification` dans `src/hooks/useNotification.ts` fournit toutes les fonctionnalités nécessaires pour gérer les notifications côté client :

   ```typescript

   const {

     isSubscribed, // Si l'utilisateur est abonné aux notifications
     isLoading, // Si la vérification est en cours
     subscribe, // Fonction pour s'abonner
     unsubscribe, // Fonction pour se désabonner
     pushMessage, // Fonction pour envoyer une notification

   } = useNotification();

   ```

2. **Composant `NotificationToggle`**

   Le composant `NotificationToggle` dans `src/components/notification/NotificationToggle.tsx` permet à l'utilisateur d'activer/désactiver les notifications dans l'interface :

   ```tsx

   <NotificationToggle />

   ```

### Comment envoyer une notification

#### 1. Via le hook useNotification (côté client)

```typescript
import { useNotification } from "@/hooks/useNotification";

function MyComponent() {
  const { pushMessage } = useNotification();
  const sendTestNotification = async () => {
    const notification = {
      title: "Nouveau message",
      message: "Vous avez reçu un nouveau message",
      target: {
        type: "user",
        id: "user_id_123", // ID de l'utilisateur cible
      },
      data: {
        path: "/messages/123", // Chemin de redirection
        priority: "high", // Priorité de la notification
      },
    };
    await pushMessage(notification);
  };

  return (
    <button onClick={sendTestNotification}>
      Envoyer une notification test
    </button>
  );
}
```

#### 2. Via l'API (côté serveur ou services)

Pour envoyer une notification depuis le serveur ou un service backend, utilisez l'API `/api/notification/push` :

```typescript
// Exemple d'envoi de notification via l'API

async function sendServerNotification() {
  const notification = {
    title: "Mise à jour importante",
    message: "Une nouvelle version de l'application est disponible",
    target: {
      type: "role",
      id: "ADMIN", // Envoyer à tous les utilisateurs avec le rôle ADMIN
    },
    data: {
      path: "/updates",
      priority: "high",
      timestamp: Date.now(),
    },

    // Options facultatives :

    actions: [
      {
        action: "open",
        title: "Voir les détails",
      },
      {
        action: "close",
        title: "Plus tard",
      },
    ],
    vibrate: [200, 100, 200], // Motif de vibration personnalisé
    icon: "/custom-icon.png", // Icône personnalisée
  };



  const response = await fetch("/api/notification/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notification),
  });
  const result = await response.json();
  console.log(`Notifications envoyées: ${result.sent}/${result.total}`);
}
```

### Structure des données de notification

```typescript
// Structure complète d'une notification

interface NotificationRequest {
  // Champs obligatoires
  title: string; // Titre de la notification
  message: string; // Corps du message
  target: {
    type: "user" | "role"; // Cibler un utilisateur ou un rôle
    id: string; // ID de l'utilisateur ou du rôle
  };
  // Champs optionnels
  data?: {
    path?: string; // Chemin de redirection
    priority?: "high" | "normal" | "low";
    [key: string]: any; // Autres données personnalisées
  };

  icon?: string; // URL de l'icône
  badge?: string; // URL du badge (petite icône)
  vibrate?: number[]; // Motif de vibration [200, 100, 200]
  actions?: Array<{
    action: string; // Identifiant de l'action
    title: string; // Texte affiché sur le bouton
  }>;
  renotify?: boolean; // Notifier même si une notification existe déjà
  requireInteraction?: boolean; // Nécessite une interaction utilisateur
}
```

## 5. Gestion des Abonnements

### Comment s'abonner aux notifications

L'abonnement est géré automatiquement par le hook `useNotification`. Pour permettre à l'utilisateur de s'abonner, utilisez simplement le composant `NotificationToggle` ou appelez la fonction `subscribe()` du hook.

```typescript
import { useNotification } from "@/hooks/useNotification";

function NotificationSettings() {
  const { isSubscribed, subscribe, unsubscribe } = useNotification();
  return (
    <div>
      <h2>Paramètres de notification</h2>
      <button onClick={isSubscribed ? unsubscribe : subscribe}>
       {isSubscribed
          ? "Désactiver les notifications"
          : "Activer les notifications"}
      </button>
    </div>
  );
}
```

### Stockage des abonnements

Les abonnements sont automatiquement stockés dans la base de données via l'API `/api/notification/subscribe`. Le schéma Prisma pour les abonnements est le suivant :

```prisma
model PushSubscription {

  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 6. Configuration Avancée

### Personnalisation des Notifications

Pour personnaliser l'apparence et le comportement des notifications, modifiez le fichier `src/config/notification.constants.ts` :

```typescript
// Exemple de modifications dans notification.constants.ts

export const DEFAULT_ICONS = {
  ICON: "/icons/custom-icon.png", // Icône principale
  BADGE: "/icons/custom-badge.png", // Badge (petite icône)
};

export const DEFAULT_VIBRATE_PATTERN = [300, 150, 300]; // Motif de vibration personnalisé

export const DEFAULT_NOTIFICATION_ACTIONS = [
  {
    action: "view",
    title: "Voir maintenant",
  },
  {
    action: "dismiss",
    title: "Ignorer",
  },
];
```

### Gestion des Actions de Notification

Le service worker est configuré pour gérer les clics sur les notifications. Pour personnaliser ce comportement, modifiez `src/lib/servicesWorker/index.ts` :

```typescript
// Exemple de modifications dans index.ts

self.addEventListener("notificationclick", (event) => {

  // Fermer la notification

  event.notification.close();



  // Extraire l'action et les données

  const action = event.action;
  const data = event.notification.data;
  // Définir le comportement selon l'action
  switch (action) {
    case "open":

      // Ouvrir la page spécifiée

      return event.waitUntil(navigateToUrl(data.path || "/"));
    case "dismiss":
      // Ne rien faire, juste fermer la notification
      return;
    default:
      // Comportement par défaut : ouvrir la page spécifiée
     return event.waitUntil(navigateToUrl(data.path || "/"));
  }
});
```

## 7. Résolution des Problèmes Courants

### Notification "Copier l'URL" sur Android

Si vous voyez une notification "Appuyer pour copier l'URL" lors de l'ouverture des notifications sur Android :

1. Vérifiez la configuration dans `app.config.ts` :

   ```typescript

   // Ajoutez cette ligne dans app.config.ts

   handle_links: "preferred", // Préférer ouvrir les liens dans la PWA

   ```

2. Assurez-vous que le service worker gère correctement les clics de notification :

   ```typescript

   // Dans src/lib/servicesWorker/index.ts

   self.addEventListener("notificationclick", (event) => {

     event.notification.close();

     const url = new URL(

       event.notification.data?.path || "/",

       self.location.origin

     ).href;

     // Utiliser l'URL complète pour éviter les problèmes de navigation

     event.waitUntil(navigateToUrl(url));

   });

   ```

3. Vérifiez que la PWA est bien installée et configurée comme application par défaut pour son domaine sur l'appareil.

### Les notifications ne fonctionnent pas

1. Vérifiez la console pour les erreurs
2. Assurez-vous que les clés VAPID sont correctement configurées dans `.env.local`
3. Vérifiez que le service worker est bien enregistré dans le navigateur 
4. Assurez-vous que l'utilisateur a donné les permissions nécessaires 

## 8. Utilisation en Environnement de Production

### Liste de vérification avant déploiement

1. **HTTPS** : Assurez-vous que l'application est servie en HTTPS (obligatoire pour les PWA)
2. **Variables d'environnement** : Vérifiez que les clés VAPID sont configurées
3. **Icônes** : Vérifiez que toutes les tailles d'icônes sont présentes
4. **Manifeste** : Validez le manifeste avec l'outil Lighthouse

### Variables d'environnement requises

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_clé_publique

VAPID_PRIVATE_KEY=votre_clé_privée

WEB_PUSH_EMAIL=votre_email@exemple.com
```

## 9. Génération des Clés VAPID

Si vous devez régénérer les clés VAPID :

```bash
npx web-push generate-vapid-keys
```

Ajoutez les clés au fichier `.env.local` ou au gestionnaire de secrets de votre environnement de production.

## 10. Ressources et Documentation

- [Documentation de web-push](https://www.npmjs.com/package/web-push)
  
- [Guide Web Push MDN](https://developer.mozilla.org/fr/docs/Web/API/Push_API)
  
- [next-pwa](https://www.npmjs.com/package/@ducanh2912/next-pwa)
  
- [PWA Builder](https://www.pwabuilder.com/) - Pour tester et générer des ressources PWA