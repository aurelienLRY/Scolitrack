# Système de Notifications Push

Permet d’envoyer des notifications Web Push aux utilisateurs **connectés et abonnés** (`PushSubscription.userId`).

Documentation produit / inscriptions : [`docs/wiki/Notifications-Inscriptions.md`](../../../../docs/wiki/Notifications-Inscriptions.md)  
Guide PWA / VAPID : [`docs/wiki/PWA.md`](../../../../docs/wiki/PWA.md)

## Structure

```
/api/notification/
├── notify/        # POST — envoi (session auth) → délègue à web-push.service
├── subscribe/     # POST — enregistrement d’un abonnement
├── unsubscribe/   # POST — suppression d’un abonnement
└── README.md

/lib/services/
└── web-push.service.ts   # sendWebPushToUserIds / Role / Privilege (à utiliser côté métier)
```

> Ancien chemin `/api/notification/push` : remplacé par **`/api/notification/notify`**.

## Abonnement

1. L’utilisateur active les notifications (`NotificationToggle` ou bandeau formulaire inscription).
2. Permission navigateur → `pushManager.subscribe` (clé VAPID publique).
3. `POST /api/notification/subscribe` enregistre endpoint + clés liées au `userId` de session.

## Envoi

### Depuis le code métier (recommandé)

```ts
import { sendWebPushToPrivilege } from "@/lib/services/web-push.service";
import { PrivilegeName } from "@/config/privileges.config";

await sendWebPushToPrivilege(PrivilegeName.MANAGE_ENROLLMENTS, {
  title: "Dossier soumis",
  message: "…",
  path: "/private/enrollment/files/…",
});
```

### Via HTTP

`POST /api/notification/notify` (utilisateur authentifié) :

```json
{
  "title": "Titre",
  "message": "Corps",
  "target": { "type": "user", "id": "userId" },
  "data": { "path": "/chemin" }
}
```

`target.type` : `"user"` (id = userId) ou `"role"` (id = `roleName`).

## Variables d’environnement

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
WEB_PUSH_EMAIL=contact@exemple.com
```

## Limites

- Pas d’abonnement anonyme (sans compte User).
- Les parents sans compte reçoivent les infos d’inscription **par email** uniquement.
- Pas d’inbox BDD pour l’instant (`notification.service.ts` est un stub).
