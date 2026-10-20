# POST `/api/notification/notify`

Envoi HTTP de notifications push (session authentifiée requise).

Pour le code métier, préférer directement :

`src/lib/services/web-push.service.ts`

Doc globale : [`../README.md`](../README.md)  
Inscriptions : [`docs/wiki/Notifications-Inscriptions.md`](../../../../../docs/wiki/Notifications-Inscriptions.md)

## Corps

```json
{
  "title": "Titre",
  "message": "Message",
  "target": { "type": "user", "id": "<userId>" },
  "data": { "path": "/chemin/apres/clic" }
}
```

`target.type` : `"user"` | `"role"` (`id` = `roleName` Prisma).
