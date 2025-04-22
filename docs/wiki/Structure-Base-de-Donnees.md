# Structure de la Base de Données - Scolitrack

Ce document décrit la structure complète de la base de données utilisée par Scolitrack, incluant tous les modèles et leurs relations.

## Table des matières

- [Introduction](#introduction)
- [Authentification et Utilisateurs](#authentification-et-utilisateurs)
- [Établissements et Organisation](#établissements-et-organisation)
- [Commissions](#commissions)
- [Familles et Élèves](#familles-et-élèves)
- [Santé et Sécurité des Élèves](#santé-et-sécurité-des-élèves)
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
| emailVerified | DateTime? | Date de vérification de l'email |
| roleName | String | Rôle (SUPER_ADMIN, ADMIN, TEACHER, PARENT, etc.) |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

#### Champs spécifiques aux parents
| Champ | Type | Description |
|-------|------|-------------|
| parentType | String? | Type de parent (MERE, PERE, TUTEUR, AUTRE) |
| firstName | String? | Prénom |
| lastName | String? | Nom de famille |
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

## Relations Clés

### Relations Utilisateur
- Un utilisateur peut être lié à un établissement en tant qu'administrateur
- Un utilisateur peut être membre de plusieurs commissions
- Un utilisateur (parent) peut être membre de plusieurs familles
- Un utilisateur a un rôle qui détermine ses privilèges

### Relations Familiales
- Une famille est une entité de liaison entre parents et élèves
- Un élève appartient à une seule famille mais peut avoir plusieurs adresses
- Les adresses des élèves sont dérivées des adresses des parents
- En cas de garde alternée, un élève est lié à deux adresses de parents différents

### Relations Scolaires
- Un élève peut être assigné à une classe et un niveau d'éducation
- Une classe peut accueillir plusieurs élèves
- Un niveau d'éducation peut être associé à plusieurs classes

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