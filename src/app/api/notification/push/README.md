# API de Notifications Push

## Aperçu

Cette API permet d'envoyer des notifications push aux utilisateurs abonnés en fonction de leurs rôles. Elle utilise la Web Push API et nécessite une base de données pour stocker les abonnements des utilisateurs.

## Structure

```
notification-push/
├── route.ts       # Point d'entrée de l'API
└── README.md      # Documentation (ce fichier)
```

## Fonctionnement

L'API `/api/notification-push` accepte des requêtes POST pour envoyer des notifications push aux utilisateurs abonnés. Elle filtre les destinataires en fonction du rôle spécifié dans la requête.

### Prérequis

1. Clés VAPID configurées dans les variables d'environnement :

   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `WEB_PUSH_EMAIL`

2. Une base de données contenant :

   - Les abonnements des utilisateurs (endpoint, clés p256dh et auth)
   - Les rôles des utilisateurs

3. Un service worker configuré côté client pour recevoir les notifications

## Utilisation

### Envoi d'une notification

```typescript
// Exemple d'utilisation côté client
async function sendNotification(title, message, role) {
  const response = await fetch("/api/notification-push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title, // Titre de la notification
      message, // Corps de la notification
      role, // Rôle cible (ex: "admin", "moderator", "user")
    }),
  });

  return await response.json();
}
```

### Format de la requête

```json
{
  "title": "Titre de la notification",
  "message": "Contenu de la notification",
  "role": "moderator"
}
```

### Format de la réponse

```json
{
  "success": true,
  "sent": 3,
  "failed": 1,
  "total": 4
}
```

## Intégration avec la base de données

Cette API est conçue pour fonctionner avec une base de données qui stocke les abonnements des utilisateurs. Le schéma recommandé est le suivant :

```prisma
model User {
  id            String         @id
  subscriptions Subscription[]
  userRoles     UserRole[]
}

model Role {
  id        String     @id
  name      String     @unique
  users     UserRole[]
}

model UserRole {
  userId    String
  roleId    String
  user      User     @relation(fields: [userId], references: [id])
  role      Role     @relation(fields: [roleId], references: [id])

  @@unique([userId, roleId])
}

model Subscription {
  id        String   @id
  userId    String
  endpoint  String
  p256dh    String
  auth      String
  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, endpoint])
}
```

## Sécurité

- Cette API nécessite une authentification appropriée pour éviter les abus
- Seuls les utilisateurs autorisés devraient pouvoir envoyer des notifications
- Les clés VAPID doivent être sécurisées et ne jamais être exposées côté client (à l'exception de la clé publique)

## Dépannage

### Problèmes courants

1. **Les notifications ne sont pas reçues**

   - Vérifiez que le service worker est correctement enregistré
   - Assurez-vous que les permissions de notification sont accordées
   - Vérifiez la validité des abonnements en base de données

2. **Erreurs d'authentification VAPID**

   - Vérifiez que les clés VAPID sont correctement configurées
   - Assurez-vous que l'email associé est valide

3. **Abonnements expirés**
   - Mettez en place un mécanisme pour nettoyer les abonnements expirés
   - Implémentez une logique de réabonnement côté client
