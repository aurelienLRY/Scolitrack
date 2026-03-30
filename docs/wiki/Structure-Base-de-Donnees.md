# Structure de la Base de Données - Scolitrack

Ce document décrit la structure complète de la base de données utilisée par Scolitrack, incluant tous les modèles et leurs relations.

## Table des matières

- [Introduction](#introduction)
- [Authentification et Utilisateurs](#authentification-et-utilisateurs)
- [Établissements et Organisation](#établissements-et-organisation)
- [Commissions](#commissions)
- [Familles et Élèves](#familles-et-élèves)
- [Santé et Sécurité des Élèves](#santé-et-sécurité-des-élèves)
- [Module d'Inscription Scolaire](#module-dinscription-scolaire)
- [Journal d'Activité](#journal-dactivité)
- [Relations Clés](#relations-clés)
- [Cas d'Utilisation](#cas-dutilisation)

## Introduction

La base de données de Scolitrack est conçue pour gérer l'ensemble des données d'un établissement scolaire, incluant les utilisateurs, les élèves, les familles, les classes, et plus encore. Elle est implémentée avec Prisma et MySQL.

## Authentification et Utilisateurs

### User
Le modèle central représentant tout utilisateur dans le système.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Identifiant unique |
| email | String (unique) | Email de l'utilisateur |
| name | String? | Nom complet |
| password | String? | Mot de passe hashé |
| image | String? | URL de l'image de profil |
| emailVerified | DateTime? | Date de vérification de l'email |
| resetToken | String? (unique) | Token pour la réinitialisation du mot de passe |
| resetTokenExpiry | DateTime? | Date d'expiration du token de réinitialisation |
| roleName | String | Rôle (SUPER_ADMIN, ADMIN, TEACHER, PARENT, etc.) |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

#### Champs spécifiques aux parents
| Champ | Type | Description |
|-------|------|-------------|
| parentType | String? | Type de parent (MERE, PERE, TUTEUR, AUTRE) |
| firstName | String? | Prénom |
| gender | String? | Genre (M, F, N) |
| socialSecurityNum | String? | Numéro de sécurité sociale |
| phoneNumber | String? | Numéro de téléphone |
| address | String? | Adresse |
| postalCode | String? | Code postal |
| city | String? | Ville |
| profession | String? | Profession |
| maritalStatus | String? | Situation matrimoniale |
| bio | String? | Biographie/punchline |
| skills | String? | Compétences |
| isHousekeeping | Boolean | Membre du groupe ménage |
| isDaycare | Boolean | Membre du groupe garderie |
| isCanteen | Boolean | Membre du groupe cantine |

### Role & Privilege
Gestion des rôles et privilèges pour le contrôle d'accès.

| Modèle | Champs principaux | Description |
|--------|-------------------|-------------|
| Role | id, name, isPermanent | Définit les rôles disponibles |
| Privilege | id, name | Définit les privilèges (droits d'accès) |
| RolePrivilege | roleId, privilegeId | Table de jointure entre rôles et privilèges |

### Authentication
Tables liées à l'authentification et aux sessions.

| Modèle | Description |
|--------|-------------|
| Account | Comptes liés (OAuth, etc.) |
| Session | Sessions actives |
| VerificationToken | Tokens de vérification (reset password, etc.) |
| PushSubscription | Abonnements pour notifications push |

## Établissements et Organisation

### Establishment
Représente un établissement scolaire.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Identifiant unique |
| name | String | Nom de l'établissement |
| address | String | Adresse |
| postalCode | String | Code postal |
| city | String | Ville |
| email | String? | Email de contact |
| phone | String? | Téléphone |
| website | String? | Site web |
| adminId | String | ID du directeur/administrateur |
| logoUrl | String? | URL du logo de l'établissement |
| logoFileId | String? | ID du fichier logo |
| description | String? | Description |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### ClassRoom
Représente une classe dans l'établissement.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (uuid) | Identifiant unique |
| name | String | Nom de la classe |
| capacity | Int | Capacité d'accueil |
| logoUrl | String? | URL du logo de la classe |
| logoFileId | String? | ID du fichier logo |
| colorCode | String? | Code couleur de la classe |
| establishmentId | String | ID de l'établissement |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### EducationLevel
Niveaux d'éducation proposés par l'établissement.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (uuid) | Identifiant unique |
| name | String | Nom du niveau (ex: CE1, CE2) |
| code | String | Code du niveau |
| establishmentId | String | ID de l'établissement |
| establishedAt | DateTime | Date d'établissement |
| updatedAt | DateTime | Date de mise à jour |

## Commissions

### Commission
Représente une commission ou un groupe de travail dans l'établissement.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (uuid) | Identifiant unique |
| name | String | Nom de la commission |
| description | String? | Description |
| speciality | String? | Spécialité ou domaine |
| logoUrl | String? | URL du logo de la commission |
| logoFileId | String? | ID du fichier logo |
| colorCode | String? | Code couleur de la commission |
| establishmentId | String | ID de l'établissement |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### CommissionMember
Membres d'une commission.

| Champ | Type | Description |
|-------|------|-------------|
| userId | String | ID de l'utilisateur |
| commissionId | String | ID de la commission |
| role | String | Rôle dans la commission |
| joinedAt | DateTime | Date d'adhésion |

## Familles et Élèves

### Family
Entité de liaison entre parents et élèves.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Identifiant unique |
| name | String | Nom de la famille |
| notes | String? | Notes administratives |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### FamilyMember
Relation entre utilisateurs (parents) et familles.

| Champ | Type | Description |
|-------|------|-------------|
| familyId | String | ID de la famille |
| userId | String | ID de l'utilisateur (parent) |
| relationship | String | Relation (PRINCIPAL, SECONDAIRE, etc.) |
| isMainAddress | Boolean | Si l'adresse de ce membre est l'adresse principale |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### Student
Représente un élève.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Identifiant unique |
| firstName | String | Prénom |
| lastName | String | Nom |
| birthDate | DateTime | Date de naissance |
| birthPlace | String | Lieu de naissance |
| desiredEnrollmentDate | DateTime? | Date souhaitée d'inscription |
| previousSchool | String? | École précédente |
| currentClass | String? | Classe actuelle |
| hasSplitResidence | Boolean | Si l'élève a une résidence alternée |
| custodyArrangement | String? | Arrangement de garde (semaine paire/impaire, etc.) |
| legalGuardians | String | Description des responsables légaux |
| primaryAddressUserId | String? | ID du parent avec l'adresse principale |
| secondaryAddressUserId | String? | ID du parent avec l'adresse secondaire |
| insuranceProvider | String? | Assureur |
| insuranceNumber | String? | Numéro de contrat d'assurance |
| insuranceCertificate | String? | Lien vers l'attestation d'assurance |
| familyId | String | ID de la famille |
| educationLevelId | String? | ID du niveau d'éducation |
| classRoomId | String? | ID de la classe |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

## Santé et Sécurité des Élèves

### MedicalInformation
Informations médicales d'un élève.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Identifiant unique |
| studentId | String (unique) | ID de l'élève |
| fileNumber | String | Numéro de dossier |
| healthBooklet | String? | Carnet de santé |
| medicalCertificate | String? | Certificat médical |
| hasRubella, hasChickenpox, etc. | Boolean | Maladies contractées |
| hasAsthma, hasRheumatism | Boolean | Conditions médicales |
| healthDetails | String? | Détails de santé (allergies, etc.) |
| doctorName | String? | Médecin traitant |
| medicalConsent | Boolean | Autorisation d'intervention médicale |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### AuthorizedPickup
Personnes autorisées à récupérer un élève.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Identifiant unique |
| studentId | String | ID de l'élève |
| firstName | String | Prénom |
| lastName | String | Nom |
| relationship | String | Relation avec l'élève |
| phoneNumber | String | Téléphone |
| identityDocument | String? | Document d'identité |
| startDate | DateTime? | Date de début d'autorisation |
| endDate | DateTime? | Date de fin d'autorisation |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### EmergencyContact
Contacts d'urgence pour un élève.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Identifiant unique |
| studentId | String | ID de l'élève |
| firstName | String | Prénom |
| lastName | String | Nom |
| relationship | String | Relation avec l'élève |
| phoneNumber | String | Téléphone principal |
| alternatePhone | String? | Téléphone secondaire |
| priority | Int | Priorité de contact |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

## Module d'Inscription Scolaire

Le module d'inscription scolaire permet de gérer les campagnes d'inscription et les dossiers d'inscription des familles.

### EnrollmentCampaign
Représente une campagne d'inscription (période pendant laquelle les inscriptions sont ouvertes).

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Identifiant unique |
| name | String | Nom de la campagne |
| startDate | DateTime | Date de début de la campagne |
| endDate | DateTime | Date de fin de la campagne |
| creatorId | String | ID de l'administrateur qui a créé la campagne |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### EnrollmentFile
Représente un dossier d'inscription d'une famille pour une campagne donnée.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Identifiant unique |
| campaignId | String | ID de la campagne d'inscription |
| familyId | String? | ID de la famille (null si famille encore inconnue) |
| email | String | Email de contact (utile si famille inconnue) |
| status | EnrollmentStatus | Statut du dossier (DRAFT, SUBMITTED, NEED_INFO, APPROVED, REJECTED) |
| token | String (unique, uuid) | Lien sécurisé pour accéder au dossier |
| submittedAt | DateTime? | Date de soumission du dossier |
| reviewedAt | DateTime? | Date d'examen du dossier |
| reviewerId | String? | ID de l'administrateur qui a examiné le dossier |
| decisionNote | String? | Commentaire de refus ou complément d'information |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### EnrollmentStudent
Table de liaison entre un dossier d'inscription et les élèves concernés.

| Champ | Type | Description |
|-------|------|-------------|
| fileId | String | ID du dossier d'inscription |
| studentId | String | ID de l'élève |
| createdAt | DateTime | Date de création |

**Note :** Un même élève peut apparaître dans plusieurs campagnes d'inscription (par exemple, réinscription chaque année).

### EnrollmentHistory
Historique des changements de statut d'un dossier d'inscription.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Identifiant unique |
| fileId | String | ID du dossier d'inscription |
| oldStatus | EnrollmentStatus | Ancien statut |
| newStatus | EnrollmentStatus | Nouveau statut |
| actorId | String? | ID de l'utilisateur qui a effectué l'action (admin ou parent) |
| note | String? | Note ou commentaire sur le changement |
| timestamp | DateTime | Date et heure du changement |

### EnrollmentStatus (Enum)
Énumération des statuts possibles pour un dossier d'inscription :

| Valeur | Description |
|--------|-------------|
| DRAFT | Lien envoyé, dossier pas encore soumis |
| SUBMITTED | Parent a cliqué "envoyer" |
| NEED_INFO | Administrateur demande un complément d'information |
| APPROVED | Dossier accepté |
| REJECTED | Dossier refusé |

> **Règle d'accès parent importante :**
> le token d'inscription donne un accès public limité au dossier (lecture/mise à jour du dossier uniquement).
> Tant que le dossier n'est pas validé (`APPROVED`), aucun compte parent actif ne doit donner accès à la plateforme privée.

## Journal d'Activité

### ActivityLog
Enregistre les actions des utilisateurs dans le système pour des raisons d'audit et de sécurité.

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Identifiant unique |
| userId | String | ID de l'utilisateur qui a effectué l'action |
| action | String | Description de l'action effectuée |
| details | String? | Détails supplémentaires sur l'action |
| createdAt | DateTime | Date et heure de l'action |

## Relations Clés

### Relations Utilisateur
- Un utilisateur peut être lié à un établissement en tant qu'administrateur
- Un utilisateur peut être membre de plusieurs commissions
- Un utilisateur (parent) peut être membre de plusieurs familles
- Un utilisateur a un rôle qui détermine ses privilèges
- Un utilisateur peut créer des campagnes d'inscription
- Un utilisateur peut examiner et valider des dossiers d'inscription
- Un utilisateur peut effectuer des actions enregistrées dans le journal d'activité

### Relations Familiales
- Une famille est une entité de liaison entre parents et élèves
- Un élève appartient à une seule famille mais peut avoir plusieurs adresses
- Les adresses des élèves sont dérivées des adresses des parents
- En cas de garde alternée, un élève est lié à deux adresses de parents différents
- Une famille peut avoir plusieurs dossiers d'inscription (un par campagne)

### Relations Scolaires
- Un élève peut être assigné à une classe et un niveau d'éducation
- Une classe peut accueillir plusieurs élèves
- Un niveau d'éducation peut être associé à plusieurs classes

### Relations d'Inscription
- Une campagne d'inscription peut avoir plusieurs dossiers d'inscription
- Un dossier d'inscription appartient à une campagne et est lié à une famille
- Un dossier d'inscription peut concerner plusieurs élèves
- Un élève peut avoir plusieurs dossiers d'inscription (pour différentes campagnes)
- Chaque changement de statut d'un dossier est enregistré dans l'historique

## Cas d'Utilisation

### Gestion des Familles Séparées

La structure permet de gérer efficacement les cas de familles séparées :

1. Création d'une famille "Dupont-Martin"
2. Ajout du père (M. Dupont) comme membre avec son adresse
3. Ajout de la mère (Mme Martin) comme membre avec son adresse différente
4. Lors de la création de l'élève (enfant), on indique :
   - `hasSplitResidence = true`
   - `primaryAddressUserId` = ID de M. Dupont
   - `secondaryAddressUserId` = ID de Mme Martin
   - `custodyArrangement` = "Semaine paire chez le père, semaine impaire chez la mère"

Ainsi, l'application peut afficher les deux adresses de l'enfant selon la situation de garde.

### Gestion des Autorisations de Sortie

1. Les parents définissent qui peut récupérer leurs enfants via le modèle `AuthorizedPickup`
2. Chaque personne autorisée peut avoir une période d'autorisation définie
3. L'école peut vérifier rapidement si une personne est autorisée à récupérer un enfant

### Gestion des Urgences Médicales

1. Les informations médicales complètes sont stockées dans `MedicalInformation`
2. Les contacts d'urgence sont classés par priorité dans `EmergencyContact`
3. En cas d'urgence, l'école peut accéder rapidement à l'historique médical et aux contacts prioritaires

### Gestion des Inscriptions Scolaires

Le module d'inscription permet de gérer le processus complet d'inscription des élèves :

1. **Création d'une campagne d'inscription**
   - L'administrateur crée une campagne avec des dates de début et de fin
   - Exemple : "Inscription 2025-2026" du 1er mars au 30 juin 2025

2. **Génération de liens d'inscription**
   - L'administrateur génère un lien sécurisé (token unique) par famille
   - Le lien est envoyé par email à la famille
   - Le dossier est créé avec le statut `DRAFT`

3. **Remplissage du dossier par les parents**
   - Les parents accèdent au formulaire via le lien sécurisé
   - Ils remplissent les informations de la famille et des enfants
   - Ils peuvent sauvegarder et revenir plus tard (statut reste `DRAFT`)

4. **Soumission du dossier**
   - Une fois le formulaire complet, les parents soumettent le dossier
   - Le statut passe à `SUBMITTED` et la date de soumission est enregistrée
   - L'action est enregistrée dans l'historique

5. **Examen par l'administration**
   - L'administrateur examine les dossiers soumis
   - Il peut :
     - **Accepter** le dossier (statut `APPROVED`)
     - **Refuser** le dossier (statut `REJECTED`) avec une note explicative
     - **Demander des compléments** (statut `NEED_INFO`) avec une note précisant ce qui manque
   - Chaque changement de statut est enregistré dans l'historique avec l'ID de l'administrateur

6. **Compléments d'information**
   - Si le statut est `NEED_INFO`, les parents sont notifiés
   - Ils peuvent modifier le dossier et le soumettre à nouveau
   - Le statut repasse à `SUBMITTED`

7. **Suivi et audit**
   - L'historique complet des changements de statut est conservé
   - On peut savoir qui a effectué quelle action et quand
   - Les dossiers acceptés peuvent être transformés en inscriptions effectives
   - L'activation/création du compte parent et l'accès plateforme interviennent après validation (`APPROVED`)