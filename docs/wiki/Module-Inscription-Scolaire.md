# Module "Campagne d'inscription scolaire"

## Aperçu

Le module "Campagne d'inscription scolaire" permet à l'établissement de :

1. **Planifier** des campagnes d'inscription sur une période donnée
2. **Générer** des dossiers d'inscription pré-remplis pour les familles cibles
3. **Suivre** l'avancement des dossiers à travers différents statuts
4. **Notifier** automatiquement les familles par email à chaque étape
5. **Créer** un compte parent uniquement après validation (`APPROVED`) si la famille n'existait pas

## Structure des données

### Modèles dans Prisma

Le module repose sur quatre modèles principaux :

#### `EnrollmentCampaign` - Campagne d'inscription

```prisma
model EnrollmentCampaign {
  id          String    @id @default(cuid())
  name        String
  startDate   DateTime
  endDate     DateTime
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Campagne créée par un administrateur
  creatorId   String
  creator     User      @relation(fields: [creatorId], references: [id])

  enrollmentFiles EnrollmentFile[]
  
  @@index([creatorId])
}
```

#### `EnrollmentFile` - Dossier d'inscription

```prisma
model EnrollmentFile {
  id             String           @id @default(cuid())
  campaignId     String
  familyId       String?          // null si famille encore inconnue
  email          String           // e‑mail de contact (utile si famille inconnue)
  status         EnrollmentStatus @default(DRAFT)
  token          String           @unique @default(uuid()) // lien sécurisé
  submittedAt    DateTime?
  reviewedAt     DateTime?
  reviewerId     String?          // administrateur qui a pris la décision
  decisionNote   String?          // commentaire refus / complément
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  campaign       EnrollmentCampaign @relation(fields: [campaignId], references: [id])
  family         Family?            @relation(fields: [familyId], references: [id])
  reviewer       User?              @relation("reviewer", fields: [reviewerId], references: [id])

  students       EnrollmentStudent[]  // enfants concernés
  history        EnrollmentHistory[]
  
  @@index([campaignId])
  @@index([familyId])
  @@index([reviewerId])
  @@index([email])
  @@index([status])
}
```

#### `EnrollmentStudent` - Liaison étudiants/dossier

```prisma
model EnrollmentStudent {
  fileId        String
  studentId     String   // le même élève peut apparaître sur plusieurs campagnes
  createdAt     DateTime @default(now())

  enrollmentFile EnrollmentFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
  student        Student        @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@id([fileId, studentId])
  @@index([fileId])
  @@index([studentId])
}
```

#### `EnrollmentHistory` - Historique des statuts

```prisma
model EnrollmentHistory {
  id             String          @id @default(cuid())
  fileId         String
  oldStatus      EnrollmentStatus
  newStatus      EnrollmentStatus
  actorId        String?         // admin ou parent
  note           String?
  timestamp      DateTime        @default(now())

  enrollmentFile EnrollmentFile  @relation(fields: [fileId], references: [id], onDelete: Cascade)
  actor          User?           @relation("actor", fields: [actorId], references: [id])

  @@index([fileId])
  @@index([actorId])
}
```

#### `EnrollmentStatus` - Enum des statuts

```prisma
enum EnrollmentStatus {
  DRAFT        // lien envoyé – pas encore soumis
  SUBMITTED    // parent a cliqué "envoyer"
  NEED_INFO    // admin demande un complément
  APPROVED     // dossier accepté
  REJECTED     // dossier refusé
}
```

## Flux du processus d'inscription

1. **Création de la campagne** par un administrateur
   - Définition d'une période (dates de début et fin)
   - Attribution d'un nom et description

2. **Génération des dossiers d'inscription**
   - Pour des familles existantes : pré-remplissage des informations
   - Pour de nouvelles familles : envoi d'une invitation par email

3. **Réception et remplissage par les familles**
   - Accès via lien sécurisé (token unique)
   - Formulaire adaptatif selon profil (nouvelle famille ou famille existante)
   - Ajout des élèves et informations requises

4. **Soumission du dossier**
   - Transition du statut `DRAFT` à `SUBMITTED`
   - Notification automatique à l'administrateur

5. **Traitement administratif**
   - Examen du dossier par l'administration
   - Possibilité de demander des compléments (`NEED_INFO`)
   - Décision finale : `APPROVED` ou `REJECTED`

6. **Notification des familles**
   - Email automatique à chaque changement de statut
   - Contenu personnalisé selon le statut

7. **Création de compte (si nouvelle famille)**
   - Tant que le dossier n'est pas validé (`APPROVED`), les parents n'ont pas de compte plateforme actif
   - Le lien token permet uniquement la préparation/soumission du dossier (accès public limité)
   - À l'approbation d'un dossier, création automatique du compte parent et profil famille si nécessaire

## Privilèges et sécurité

Le module introduit deux privilèges applicatifs principaux :

- `MANAGE_ENROLLMENTS` : Gestion globale des inscriptions
- `MANAGE_CAMPAIGNS` : Création et gestion des campagnes

## API Routes

### Gestion des campagnes

- `GET /api/enrollment/campaigns` : Liste des campagnes (filtrable par statut)
- `POST /api/enrollment/campaigns` : Création d'une nouvelle campagne
- `GET /api/enrollment/campaigns/[id]` : Détails d'une campagne
- `PUT /api/enrollment/campaigns/[id]` : Mise à jour d'une campagne
- `DELETE /api/enrollment/campaigns/[id]` : Suppression d'une campagne

### Gestion des dossiers

- `GET /api/enrollment/files` : Liste des dossiers (filtrable par statut, campagne, etc.)
- `POST /api/enrollment/files` : Création d'un nouveau dossier
- `GET /api/enrollment/files/[id]` : Détails d'un dossier
- `PUT /api/enrollment/files/[id]` : Mise à jour d'un dossier
- `PUT /api/enrollment/files/[id]/status` : Changement de statut
- `GET /api/enrollment/files/token/[token]` : Accès public par token (sans compte parent)

### Gestion des élèves dans un dossier

- `POST /api/enrollment/files/[id]/students` : Ajout d'un élève
- `DELETE /api/enrollment/files/[id]/students/[studentId]` : Retrait d'un élève

### Génération de dossiers en masse

- `POST /api/enrollment/campaigns/[id]/generate` : Génération de dossiers pour une liste d'emails

## Services

### `campaign.service.ts`

Gère les campagnes d'inscription :
- Création, modification, suppression
- Récupération (toutes, actives, à venir)
- Statistiques

### `file.service.ts`

Gère les dossiers d'inscription :
- Création, modification, suppression
- Gestion des statuts avec historique
- Intégration avec étudiants
- Notifications automatiques

## Schémas de validation

### `EnrollmentSchema.ts`

Contient les schémas Yup pour valider :
- Création/modification de campagnes
- Création/modification de dossiers
- Changements de statut
- Ajout d'étudiants

## Interface utilisateur

L'interface est organisée en deux sections principales :

### Administration (Dashboard)

- Vue d'ensemble des campagnes
- Statistiques d'avancement
- Liste des dossiers avec filtres
- Interface de traitement des dossiers

### Formulaire public

- Interface accessible via token (sans authentification compte parent)
- Formulaire adaptatif selon le statut
- Processus guidé en plusieurs étapes

## Notifications

Les notifications sont envoyées automatiquement à plusieurs étapes :

1. **Invitation** : Lorsqu'un dossier est créé
2. **Confirmation** : Lorsqu'un dossier est soumis
3. **Demande d'information** : Lorsque l'administration demande des compléments
4. **Décision** : Approbation ou refus du dossier

## Intégration avec les modules existants

Le module d'inscription s'intègre avec :

- **Module Famille** : Création/mise à jour des familles
- **Module Étudiant** : Association des étudiants aux dossiers
- **Module Utilisateur** : Création de comptes parents
- **Module Notification** : Envoi d'emails et notifications push

## Comment utiliser le module

### Pour les administrateurs

1. Créer une campagne d'inscription
2. Générer des dossiers pour les familles cibles
3. Suivre et traiter les dossiers soumis
4. Approuver ou rejeter les dossiers

### Pour les familles

1. Recevoir un lien d'invitation par email
2. Remplir le formulaire d'inscription
3. Soumettre le dossier
4. Répondre aux éventuelles demandes de complément
5. Recevoir la décision finale
6. Obtenir un accès plateforme uniquement après validation du dossier (`APPROVED`)

## Utilisation des hooks TanStack Query

### Exemple d'intégration dans un composant

```tsx
import { 
  useEnrollmentCampaigns, 
  useCreateEnrollmentCampaign,
  useEnrollmentFiles 
} from "@/hooks";

function EnrollmentDashboard() {
  // Récupération des campagnes actives
  const { data: campaigns, isLoading: campaignsLoading } = useEnrollmentCampaigns({ 
    status: "active" 
  });
  
  // Récupération des dossiers soumis
  const { data: submittedFiles, isLoading: filesLoading } = useEnrollmentFiles({ 
    status: "SUBMITTED" 
  });
  
  // Hook de création de campagne
  const createCampaign = useCreateEnrollmentCampaign();
  
  const handleCreateCampaign = (data) => {
    createCampaign.mutate(data, {
      onSuccess: () => {
        // Notification de succès
        toast.success("Campagne créée avec succès");
      },
      onError: (error) => {
        // Gestion d'erreur
        toast.error("Erreur lors de la création");
      }
    });
  };
  
  if (campaignsLoading || filesLoading) {
    return <LoadingSkeleton />;
  }
  
  return (
    <div>
      <h1>Tableau de bord des inscriptions</h1>
      <div>
        <h2>Campagnes actives ({campaigns?.data.campaigns.length})</h2>
        {campaigns?.data.campaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
      <div>
        <h2>Dossiers soumis ({submittedFiles?.data.files.length})</h2>
        {submittedFiles?.data.files.map(file => (
          <EnrollmentFileCard key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
}
```

### Gestion du cache et invalidation

Les hooks gèrent automatiquement :
- **Cache intelligent** : Évite les requêtes inutiles
- **Invalidation automatique** : Mise à jour des données après mutations
- **États de chargement** : `isLoading`, `isPending` pour l'UX
- **Gestion d'erreurs** : `error` avec messages détaillés

### Filtres et paramètres

```tsx
// Filtres pour les campagnes
const { data } = useEnrollmentCampaigns({
  status: "active", // "active" | "upcoming" | "past"
  creatorId: "user123"
});

// Filtres pour les dossiers
const { data } = useEnrollmentFiles({
  status: "SUBMITTED",
  campaignId: "campaign123",
  familyId: "family456",
  email: "famille@example.com"
});
```

## Plan d'implémentation progressive

Pour faciliter l'intégration du module, nous recommandons une approche progressive en 4 phases :

### Phase 1 : Modèles de données et services de base

1. Ajouter les modèles Prisma pour `EnrollmentCampaign`, `EnrollmentFile`, `EnrollmentStudent` et `EnrollmentHistory`
2. Implémenter les services `campaign.service.ts` et `file.service.ts` avec les fonctions CRUD de base
3. Créer les schémas de validation dans `EnrollmentSchema.ts`

### Phase 2 : Routes API et traitement des dossiers

1. Implémenter les routes API pour les campagnes d'inscription
2. Implémenter les routes API pour les dossiers d'inscription
3. Ajouter la logique de gestion des statuts et transitions

### Phase 3 : Notifications et intégration 

1. Implémenter le système de notifications par email
2. Ajouter la création de compte utilisateur à l'approbation des dossiers
3. Intégrer avec les modules Famille et Étudiant existants

### Phase 4 : Interface utilisateur

1. Développer l'interface d'administration des campagnes
2. Créer les pages de gestion des dossiers d'inscription
3. Implémenter le formulaire public accessible par token

## Dépendances techniques

- Prisma Client : pour l'accès à la base de données
- YUP : pour la validation des données
- Services d'email : pour les notifications
- TanStack Query : pour la gestion des données côté client
- NextAuth : pour l'authentification et les privilèges

## Diagramme de workflow

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Création du dossier
    DRAFT --> SUBMITTED: Soumission par le parent
    SUBMITTED --> NEED_INFO: Demande de complément
    SUBMITTED --> APPROVED: Validation
    SUBMITTED --> REJECTED: Refus
    NEED_INFO --> SUBMITTED: Re-soumission
    APPROVED --> [*]
    REJECTED --> [*]
```

## ✅ Implémentation terminée

### Services connectés

1. **Service de journalisation** : `activityLogService` correctement importé et utilisé
2. **Service d'emails** : Templates nodemailer créés et intégrés :
   - `enrollment-invitation.email.ts` - Invitation à remplir un dossier
   - `enrollment-status-change.email.ts` - Notification de changement de statut

### API Routes complètes

Toutes les routes API sont implémentées et fonctionnelles :

- `GET/POST /api/enrollment/campaigns` - Gestion des campagnes
- `GET/PUT/DELETE /api/enrollment/campaigns/[id]` - Campagne spécifique
- `GET/POST /api/enrollment/files` - Gestion des dossiers
- `GET/PUT/DELETE /api/enrollment/files/[id]` - Dossier spécifique
- `PUT /api/enrollment/files/[id]/status` - Changement de statut
- `GET/PUT /api/enrollment/files/token/[token]` - Accès public par token
- `POST /api/enrollment/campaigns/[id]/generate` - Génération en masse

### Hooks TanStack Query

Système complet de hooks pour la gestion des données côté client :

#### Types TypeScript (`src/types/enrollment.type.ts`)
- **Types de base** : Basés sur le schéma Prisma
- **Types étendus** : Avec relations complètes (creator, family, students, etc.)
- **Types de formulaires** : Pour toutes les opérations CRUD
- **Types de filtres** : Pour les requêtes avec paramètres
- **Types de statistiques** : Pour les tableaux de bord
- **Types de réponses API** : Structure standardisée

#### Hooks de campagnes (`src/hooks/query/useEnrollment.ts`)
- `useEnrollmentCampaigns(filters?)` - Liste des campagnes avec filtres
- `useEnrollmentCampaign(id)` - Détail d'une campagne
- `useEnrollmentCampaignStats(campaignId)` - Statistiques d'une campagne
- `useCreateEnrollmentCampaign()` - Créer une campagne
- `useUpdateEnrollmentCampaign(id)` - Modifier une campagne
- `useDeleteEnrollmentCampaign()` - Supprimer une campagne
- `useGenerateEnrollmentFiles(campaignId)` - Générer des dossiers en masse

#### Hooks de dossiers
- `useEnrollmentFiles(filters?)` - Liste des dossiers avec filtres
- `useEnrollmentFile(id)` - Détail d'un dossier
- `useEnrollmentFileByToken(token)` - Accès public par token
- `useCreateEnrollmentFile()` - Créer un dossier
- `useUpdateEnrollmentFile(id)` - Modifier un dossier
- `useUpdateEnrollmentFileStatus(id)` - Changer le statut
- `useUpdateEnrollmentFileByToken(token)` - Modification publique
- `useDeleteEnrollmentFile()` - Supprimer un dossier

#### Hooks de gestion des étudiants
- `useAddStudentToEnrollment(fileId)` - Ajouter un étudiant
- `useRemoveStudentFromEnrollment(fileId)` - Retirer un étudiant

### Interface utilisateur complète

#### Système de navigation
- **Template avec fils d'ariane** : Navigation cohérente entre toutes les pages
- **Pages principales** : Dashboard, liste, création, modification, détails
- **Pages spécialisées** : Gestion des dossiers, statistiques, envoi de dossiers

#### Composants réutilisables
- **Composants de campagnes** : `CampaignCard`, `CampaignList`, `CampaignStats`
- **Composants de dossiers** : `EnrollmentFileCard`
- **Composants d'actions** : `ActionCard` pour les actions rapides
- **Skeletons** : États de chargement pour tous les composants

### Corrections appliquées

1. ✅ Types Prisma correctement importés
2. ✅ Privilèges définis dans `privileges.config.ts`
3. ✅ Services de notification connectés via templates nodemailer
4. ✅ Types explicites ajoutés partout
5. ✅ Hooks TanStack Query complets avec documentation JSDoc
6. ✅ Gestion du cache et invalidation intelligente
7. ✅ Interface utilisateur modulaire et réutilisable
8. ✅ Système de navigation cohérent

## État d'avancement

### ✅ Phase 1 : Modèles de données et services de base - TERMINÉE
- ✅ Modèles Prisma pour `EnrollmentCampaign`, `EnrollmentFile`, `EnrollmentStudent` et `EnrollmentHistory`
- ✅ Services `campaign.service.ts` et `file.service.ts` avec fonctions CRUD complètes
- ✅ Schémas de validation dans `EnrollmentSchema.ts`

### ✅ Phase 2 : Routes API et traitement des dossiers - TERMINÉE
- ✅ Routes API pour les campagnes d'inscription
- ✅ Routes API pour les dossiers d'inscription
- ✅ Logique de gestion des statuts et transitions
- ✅ Notifications par email intégrées

### ✅ Phase 3 : Interface utilisateur - TERMINÉE
- ✅ Interface d'administration des campagnes
- ✅ Pages de gestion des dossiers d'inscription
- ✅ Système de navigation cohérent
- ✅ Composants réutilisables et skeletons

### ✅ Phase 4 : Hooks TanStack Query - TERMINÉE
- ✅ Hooks complets pour toutes les opérations CRUD
- ✅ Gestion du cache et invalidation intelligente
- ✅ Types TypeScript stricts
- ✅ Documentation JSDoc complète

## Prochaines étapes

### Phase 5 : Intégration et tests (EN COURS)
1. **Intégration des hooks** : Remplacer les données mock par les vrais appels API
2. **Validation des formulaires** : Ajouter la validation Yup dans les composants
3. **Tests fonctionnels** : Tester le workflow complet d'inscription

### Phase 6 : Améliorations avancées (À VENIR)
1. **Tableau de bord analytique** : Statistiques avancées sur les campagnes et taux de conversion
2. **Automatisation supplémentaire** :
   - Rappels automatiques pour les dossiers en attente
   - Génération de dossiers basée sur des critères (âge, quartier, etc.)
3. **Personnalisation des formulaires** :
   - Possibilité de configurer les champs requis pour chaque campagne
   - Formulaires conditionnels selon le type d'élève
4. **Intégration avancée** :
   - Synchronisation avec des systèmes externes (calendrier, systèmes académiques)
   - Export des données pour analyses externes 