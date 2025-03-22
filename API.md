# Documentation API Scolitrack

## Format de Réponse Standard

Toutes les API suivent un format de réponse standard:

### Succès

```json
{
  "data": {
    /* données de réponse */
  },
  "success": true
}
```

### Erreur

```json
{
  "error": "Message d'erreur",
  "success": false
}
```

## Authentification

### POST /api/auth/signin

Authentification d'un utilisateur.

**Requête**:

```json
{
  "email": "utilisateur@example.com",
  "password": "motdepasse"
}
```

**Réponse**:

```json
{
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Nom Utilisateur",
      "email": "utilisateur@example.com",
      "roleName": "ADMIN"
    },
    "token": "jwt_token"
  },
  "success": true
}
```

## Utilisateurs

### GET /api/users

Liste tous les utilisateurs.

**Privilège requis**: `VIEW_USER`

**Paramètres de requête**:

- `limit` (optionnel): Nombre d'utilisateurs à retourner (défaut: 10)
- `offset` (optionnel): Index de départ (défaut: 0)

**Réponse**:

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Nom Utilisateur",
      "email": "utilisateur@example.com",
      "roleName": "ADMIN",
      "createdAt": "2023-01-01T12:00:00Z"
    }
  ],
  "total": 1,
  "success": true
}
```

### GET /api/users/[id]

Récupère les détails d'un utilisateur spécifique.

**Privilège requis**: `VIEW_USER`

**Réponse**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Nom Utilisateur",
    "email": "utilisateur@example.com",
    "roleName": "ADMIN",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  },
  "success": true
}
```

### POST /api/users

Crée un nouvel utilisateur.

**Privilège requis**: `CREATE_USER`

**Requête**:

```json
{
  "name": "Nouveau Utilisateur",
  "email": "nouveau@example.com",
  "password": "motdepasse",
  "roleName": "USER"
}
```

**Réponse**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Nouveau Utilisateur",
    "email": "nouveau@example.com",
    "roleName": "USER",
    "createdAt": "2023-01-01T12:00:00Z"
  },
  "success": true
}
```

### PUT /api/users/[id]

Met à jour un utilisateur existant.

**Privilège requis**: `UPDATE_USER`

**Requête**:

```json
{
  "name": "Nom Mis à Jour",
  "email": "mise_a_jour@example.com"
}
```

**Réponse**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Nom Mis à Jour",
    "email": "mise_a_jour@example.com",
    "roleName": "USER",
    "updatedAt": "2023-01-01T12:00:00Z"
  },
  "success": true
}
```

### DELETE /api/users/[id]

Supprime un utilisateur.

**Privilège requis**: `DELETE_USER`

**Réponse**:

```json
{
  "success": true,
  "message": "Utilisateur supprimé avec succès"
}
```

### PUT /api/users/[id]/role

Assigne un rôle à un utilisateur.

**Privilège requis**: `ASSIGN_ROLE`

**Requête**:

```json
{
  "roleName": "ADMIN"
}
```

**Réponse**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Nom Utilisateur",
    "email": "utilisateur@example.com",
    "roleName": "ADMIN",
    "updatedAt": "2023-01-01T12:00:00Z"
  },
  "success": true
}
```

## Rôles

### GET /api/roles

Liste tous les rôles.

**Privilège requis**: `VIEW_ROLE`

**Réponse**:

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "ADMIN",
      "description": "Administrateur avec accès restreint",
      "isPermanent": true,
      "privileges": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174001",
          "name": "CREATE_USER",
          "description": "Peut créer des utilisateurs"
        }
      ]
    }
  ],
  "success": true
}
```

### GET /api/roles/[id]

Récupère les détails d'un rôle spécifique.

**Privilège requis**: `VIEW_ROLE`

**Réponse**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "ADMIN",
    "description": "Administrateur avec accès restreint",
    "isPermanent": true,
    "privileges": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "name": "CREATE_USER",
        "description": "Peut créer des utilisateurs"
      }
    ]
  },
  "success": true
}
```

### POST /api/roles

Crée un nouveau rôle.

**Privilège requis**: `CREATE_ROLE`

**Requête**:

```json
{
  "name": "DOCTOR",
  "description": "Médecin avec accès aux dossiers patients",
  "privilegeIds": [
    "123e4567-e89b-12d3-a456-426614174001",
    "123e4567-e89b-12d3-a456-426614174002"
  ]
}
```

**Réponse**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174003",
    "name": "DOCTOR",
    "description": "Médecin avec accès aux dossiers patients",
    "isPermanent": false,
    "privileges": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "name": "CREATE_USER",
        "description": "Peut créer des utilisateurs"
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "name": "UPDATE_USER",
        "description": "Peut modifier des utilisateurs"
      }
    ]
  },
  "success": true
}
```

### PUT /api/roles/[id]

Met à jour un rôle existant.

**Privilège requis**: `UPDATE_ROLE`

**Requête**:

```json
{
  "name": "DOCTOR_CHIEF",
  "description": "Médecin chef de service",
  "privilegeIds": [
    "123e4567-e89b-12d3-a456-426614174001",
    "123e4567-e89b-12d3-a456-426614174002",
    "123e4567-e89b-12d3-a456-426614174004"
  ]
}
```

**Réponse**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174003",
    "name": "DOCTOR_CHIEF",
    "description": "Médecin chef de service",
    "isPermanent": false,
    "privileges": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "name": "CREATE_USER"
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "name": "UPDATE_USER"
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174004",
        "name": "DELETE_USER"
      }
    ]
  },
  "success": true
}
```

### DELETE /api/roles/[id]

Supprime un rôle.

**Privilège requis**: `DELETE_ROLE`

**Réponse**:

```json
{
  "success": true,
  "message": "Rôle supprimé avec succès"
}
```

**Notes**:

- Un rôle permanent ne peut pas être supprimé
- Lorsqu'un rôle est supprimé, tous les utilisateurs ayant ce rôle sont automatiquement assignés au rôle USER

## Privilèges

### GET /api/privileges

Liste tous les privilèges.

**Privilège requis**: `MANAGE_PRIVILEGES`

**Réponse**:

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "CREATE_USER",
      "description": "Peut créer des utilisateurs"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "name": "UPDATE_USER",
      "description": "Peut modifier des utilisateurs"
    }
  ],
  "success": true
}
```

### GET /api/privileges/[id]

Récupère les détails d'un privilège spécifique.

**Privilège requis**: `MANAGE_PRIVILEGES`

**Réponse**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "name": "CREATE_USER",
    "description": "Peut créer des utilisateurs",
    "roles": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "SUPER_ADMIN"
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174005",
        "name": "ADMIN"
      }
    ]
  },
  "success": true
}
```

### POST /api/privileges

Crée un nouveau privilège.

**Privilège requis**: `MANAGE_PRIVILEGES`

**Requête**:

```json
{
  "name": "EXPORT_DATA",
  "description": "Peut exporter des données"
}
```

**Réponse**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174006",
    "name": "EXPORT_DATA",
    "description": "Peut exporter des données",
    "roles": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "SUPER_ADMIN"
      }
    ]
  },
  "success": true
}
```

**Notes**:

- Lorsqu'un nouveau privilège est créé, il est automatiquement attribué au rôle SUPER_ADMIN

### PUT /api/privileges/[id]

Met à jour un privilège existant.

**Privilège requis**: `MANAGE_PRIVILEGES`

**Requête**:

```json
{
  "name": "EXPORT_ALL_DATA",
  "description": "Peut exporter toutes les données"
}
```

**Réponse**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174006",
    "name": "EXPORT_ALL_DATA",
    "description": "Peut exporter toutes les données"
  },
  "success": true
}
```

### DELETE /api/privileges/[id]

Supprime un privilège.

**Privilège requis**: `MANAGE_PRIVILEGES`

**Réponse**:

```json
{
  "success": true,
  "message": "Privilège supprimé avec succès"
}
```

**Notes**:

- Lorsqu'un privilège est supprimé, il est automatiquement retiré de tous les rôles auxquels il était associé

## Codes d'Erreur

| Code | Description                            |
| ---- | -------------------------------------- |
| 400  | Requête invalide ou données manquantes |
| 401  | Non authentifié                        |
| 403  | Non autorisé (privilèges insuffisants) |
| 404  | Ressource non trouvée                  |
| 409  | Conflit (ex: email déjà utilisé)       |
| 500  | Erreur serveur interne                 |
