# Scolitrack

Scolitrack est une application médicale permettant le suivi des patients atteints de scoliose.

## Fonctionnalités

- Gestion des utilisateurs avec rôles et privilèges dynamiques
- Authentification sécurisée avec Next-Auth
- Gestion et suivi des patients
- Interface intuitive pour les professionnels de santé
- Dashboard analytique
- API RESTful pour toutes les opérations

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/your-username/scolitrack.git
cd scolitrack

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Modifier les variables selon votre environnement

# Lancer la migration de la base de données et initialiser les données
npx prisma migrate dev
npx prisma db seed

# Démarrer le serveur de développement
npm run dev
```

## Structure du Projet

```
src/
├── app/              # Routes et pages Next.js (App Router)
│   ├── api/          # Routes API
│   │   ├── auth/     # Authentification
│   │   ├── users/    # Gestion des utilisateurs
│   │   ├── roles/    # Gestion des rôles
│   │   ├── privileges/ # Gestion des privilèges
│   └── (routes)/     # Pages de l'application
├── components/       # Composants React partagés
├── hooks/            # Hooks personnalisés
├── lib/              # Bibliothèques et utilitaires
│   ├── auth/         # Configuration d'authentification
│   ├── role/         # Gestion des rôles et privilèges
│   └── prisma/       # Client Prisma
├── types/            # Définitions de types TypeScript
└── styles/           # Styles globaux et thèmes

prisma/
├── schema.prisma     # Modèle de données
└── seed.ts           # Script d'initialisation
```

## Système d'Authentification et d'Autorisation

L'application utilise Next-Auth pour l'authentification et implémente un système dynamique de rôles et privilèges pour l'autorisation.

### Rôles Prédéfinis

- **SUPER_ADMIN** : Accès complet à toutes les fonctionnalités
- **ADMIN** : Accès à la gestion des utilisateurs et patients
- **USER** : Accès limité aux fonctionnalités de base

### API de Gestion des Rôles et Privilèges

#### Gestion des Rôles

- `GET /api/roles` - Liste tous les rôles (privilège requis: VIEW_ROLE)
- `POST /api/roles` - Crée un nouveau rôle (privilège requis: CREATE_ROLE)
- `GET /api/roles/[id]` - Récupère un rôle spécifique (privilège requis: VIEW_ROLE)
- `PUT /api/roles/[id]` - Met à jour un rôle (privilège requis: UPDATE_ROLE)
- `DELETE /api/roles/[id]` - Supprime un rôle (privilège requis: DELETE_ROLE)

#### Gestion des Privilèges

- `GET /api/privileges` - Liste tous les privilèges (privilège requis: MANAGE_PRIVILEGES)
- `POST /api/privileges` - Crée un nouveau privilège (privilège requis: MANAGE_PRIVILEGES)
- `GET /api/privileges/[id]` - Récupère un privilège spécifique (privilège requis: MANAGE_PRIVILEGES)
- `PUT /api/privileges/[id]` - Met à jour un privilège (privilège requis: MANAGE_PRIVILEGES)
- `DELETE /api/privileges/[id]` - Supprime un privilège (privilège requis: MANAGE_PRIVILEGES)

#### Attribution de Rôle

- `PUT /api/users/[id]/role` - Assigne un rôle à un utilisateur (privilège requis: ASSIGN_ROLE)

### Fonctionnalités Additionnelles

- Vérification des privilèges côté client avec le hook `useAuthorization`
- Composant `Authorization` pour l'affichage conditionnel d'éléments UI
- Middleware `withPrivilege` pour protéger les routes API

Consultez le fichier [GUIDE-ROLES-AND-PRIVILEGES.md](./GUIDE-ROLES-AND-PRIVILEGES.md) pour une documentation détaillée du système de rôles et privilèges.

## Documentation API

Voir le fichier [API.md](./API.md) pour la documentation complète des endpoints API.

## Environnement de Développement

- Node.js 18+
- PostgreSQL 12+
- TypeScript 5+
- Next.js 14+
- Prisma ORM

## Licence

Ce projet est sous licence MIT - voir [LICENSE](LICENSE) pour plus d'informations.
