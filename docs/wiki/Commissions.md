# Gestion des Commissions

Ce document explique comment fonctionne le module de gestion des commissions dans l'application Scolitrack.

## Introduction

Les commissions représentent des groupes au sein de l'école auxquels les parents d'élèves peuvent adhérer. Chaque commission est spécialisée dans un domaine particulier (communication, événements, etc.). 

Par exemple, la "Commission Communication" peut être en charge de la création du site web de l'école.

## Structure de données

### Modèle Commission

Le modèle `Commission` contient les informations suivantes :

```prisma
model Commission {
  id              String             @id @default(uuid())
  name            String
  description     String?            @db.Text
  speciality      String
  establishmentId String
  logoUrl         String?
  logoFileId      String?
  colorCode       String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  establishment   Establishment      @relation(fields: [establishmentId], references: [id])
  members         CommissionMember[]

  @@index([establishmentId])
}
```

### Modèle CommissionMember

Le modèle `CommissionMember` gère les appartenances aux commissions :

```prisma
model CommissionMember {
  userId       String
  commissionId String
  role         String           // Par exemple: "Président", "Secrétaire", "Membre"
  joinedAt     DateTime         @default(now())
  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  commission   Commission       @relation(fields: [commissionId], references: [id], onDelete: Cascade)

  @@id([userId, commissionId])
  @@index([userId])
  @@index([commissionId])
}
```

## Privilèges

Un nouveau privilège `MANAGE_COMMISSIONS` a été ajouté pour contrôler l'accès à la gestion des commissions :

```typescript
export enum PrivilegeName {
  // ... autres privilèges
  MANAGE_COMMISSIONS = "MANAGE_COMMISSIONS",
}
```

Pour vérifier si un utilisateur a ce privilège, utilisez la fonction `checkPrivilege` :

```typescript
const hasPrivilege = await checkPrivilege(PrivilegeName.MANAGE_COMMISSIONS);
```

## Backend

### Services

Le service `commission.service.ts` fournit les fonctions CRUD pour gérer les commissions et leurs membres.

#### Commissions

```typescript
// Récupérer toutes les commissions
getAllCommissions(): Promise<CommissionWithRelations[]>

// Récupérer les commissions d'un établissement
getCommissionsByEstablishment(establishmentId: string): Promise<CommissionWithRelations[]>

// Récupérer une commission par son ID
getCommissionById(id: string): Promise<CommissionWithRelations | null>

// Créer une nouvelle commission
createCommission(data: CommissionFormData): Promise<Commission>

// Mettre à jour une commission existante
updateCommission(id: string, data: CommissionUpdateFormData): Promise<Commission>

// Supprimer une commission
deleteCommission(id: string): Promise<Commission>
```

#### Membres des commissions

```typescript
// Récupérer les commissions auxquelles appartient un utilisateur
getUserCommissions(userId: string): Promise<CommissionWithRelations[]>

// Ajouter un membre à une commission
addCommissionMember(data: CommissionMemberFormData): Promise<CommissionMember>

// Supprimer un membre d'une commission
removeCommissionMember(userId: string, commissionId: string): Promise<CommissionMember>

// Mettre à jour le rôle d'un membre dans une commission
updateCommissionMemberRole(userId: string, commissionId: string, role: string): Promise<CommissionMember>
```

### API Endpoints

#### Commissions

##### GET /api/commissions

Récupère la liste des commissions. Accepte un paramètre optionnel `establishmentId` pour filtrer par établissement.

**Exemple de requête :**
```
GET /api/commissions
GET /api/commissions?establishmentId=123
```

**Exemple de réponse :**
```json
{
  "success": true,
  "feedback": "Liste des commissions récupérée avec succès",
  "data": [
    {
      "id": "1",
      "name": "Commission Communication",
      "speciality": "Communication",
      "description": "Gestion de la communication de l'école",
      "establishmentId": "123",
      "members": [...]
    }
  ]
}
```

##### POST /api/commissions

Crée une nouvelle commission. Nécessite le privilège `MANAGE_COMMISSIONS`.

**Exemple de requête :**
```json
{
  "name": "Commission Communication",
  "speciality": "Communication",
  "description": "Gestion de la communication de l'école",
  "establishmentId": "123"
}
```

**Exemple de réponse :**
```json
{
  "success": true,
  "feedback": "Commission créée avec succès",
  "data": {
    "id": "1",
    "name": "Commission Communication",
    "speciality": "Communication",
    "description": "Gestion de la communication de l'école",
    "establishmentId": "123",
    "createdAt": "2023-05-01T12:00:00Z",
    "updatedAt": "2023-05-01T12:00:00Z"
  }
}
```

##### GET /api/commissions/[id]

Récupère une commission spécifique par son ID.

**Exemple de requête :**
```
GET /api/commissions/1
```

**Exemple de réponse :**
```json
{
  "success": true,
  "feedback": "Commission récupérée avec succès",
  "data": {
    "id": "1",
    "name": "Commission Communication",
    "speciality": "Communication",
    "description": "Gestion de la communication de l'école",
    "establishmentId": "123",
    "members": [
      {
        "userId": "456",
        "commissionId": "1",
        "role": "Président",
        "user": {
          "id": "456",
          "name": "Jean Dupont",
          "email": "jean@exemple.com"
        }
      }
    ]
  }
}
```

##### PUT /api/commissions/[id]

Met à jour une commission existante. Nécessite le privilège `MANAGE_COMMISSIONS`.

**Exemple de requête :**
```json
{
  "name": "Commission Communication Web",
  "description": "Gestion de la communication web de l'école"
}
```

**Exemple de réponse :**
```json
{
  "success": true,
  "feedback": "Commission mise à jour avec succès",
  "data": {
    "id": "1",
    "name": "Commission Communication Web",
    "speciality": "Communication",
    "description": "Gestion de la communication web de l'école",
    "establishmentId": "123",
    "updatedAt": "2023-05-02T10:00:00Z"
  }
}
```

##### DELETE /api/commissions/[id]

Supprime une commission. Nécessite le privilège `MANAGE_COMMISSIONS`.

**Exemple de requête :**
```
DELETE /api/commissions/1
```

**Exemple de réponse :**
```json
{
  "success": true,
  "feedback": "Commission supprimée avec succès"
}
```

#### Membres des commissions

##### GET /api/commissions/members

Récupère les commissions auxquelles appartient l'utilisateur connecté ou un utilisateur spécifié par `userId`.

**Exemple de requête :**
```
GET /api/commissions/members
GET /api/commissions/members?userId=456
```

**Exemple de réponse :**
```json
{
  "success": true,
  "feedback": "Commissions de l'utilisateur récupérées avec succès",
  "data": [
    {
      "id": "1",
      "name": "Commission Communication",
      "speciality": "Communication",
      "description": "Gestion de la communication de l'école",
      "members": [
        {
          "userId": "456",
          "commissionId": "1",
          "role": "Président"
        }
      ]
    }
  ]
}
```

##### POST /api/commissions/members

Ajoute un membre à une commission. Nécessite le privilège `MANAGE_COMMISSIONS`.

**Exemple de requête :**
```json
{
  "userId": "456",
  "commissionId": "1",
  "role": "Président"
}
```

**Exemple de réponse :**
```json
{
  "success": true,
  "feedback": "Membre ajouté à la commission avec succès",
  "data": {
    "userId": "456",
    "commissionId": "1",
    "role": "Président",
    "joinedAt": "2023-05-01T12:00:00Z"
  }
}
```

##### PUT /api/commissions/members/[userId]/[commissionId]

Met à jour le rôle d'un membre dans une commission. Nécessite le privilège `MANAGE_COMMISSIONS`.

**Exemple de requête :**
```json
{
  "role": "Secrétaire"
}
```

**Exemple de réponse :**
```json
{
  "success": true,
  "feedback": "Rôle du membre mis à jour avec succès",
  "data": {
    "userId": "456",
    "commissionId": "1",
    "role": "Secrétaire"
  }
}
```

##### DELETE /api/commissions/members/[userId]/[commissionId]

Supprime un membre d'une commission. Nécessite le privilège `MANAGE_COMMISSIONS`.

**Exemple de requête :**
```
DELETE /api/commissions/members/456/1
```

**Exemple de réponse :**
```json
{
  "success": true,
  "feedback": "Membre supprimé de la commission avec succès"
}
```

## Frontend

### Hooks React Query

Pour interagir avec l'API des commissions, plusieurs hooks personnalisés ont été créés dans `src/hooks/query/useCommission.ts` :

```typescript
// Récupérer toutes les commissions
useCommissions(establishmentId?: string): ApiQueryResult<Commission[]>

// Récupérer une commission par son ID
useCommission(id?: string): ApiQueryResult<Commission>

// Créer une nouvelle commission
useCreateCommission(): ApiMutationResult<Commission, CommissionFormData>

// Mettre à jour une commission
useUpdateCommission(id?: string): ApiMutationResult<Commission, CommissionUpdateFormData>

// Supprimer une commission
useDeleteCommission(): ApiMutationResult<unknown, string>

// Récupérer les commissions d'un utilisateur
useUserCommissions(userId?: string): ApiQueryResult<Commission[]>

// Ajouter un membre à une commission
useAddCommissionMember(): ApiMutationResult<CommissionMember, CommissionMemberFormData>

// Mettre à jour le rôle d'un membre
useUpdateMemberRole(): ApiMutationResult<CommissionMember, UpdateMemberRoleParams>

// Supprimer un membre d'une commission
useRemoveCommissionMember(): ApiMutationResult<unknown, RemoveMemberParams>
```

### Composants React

Trois composants principaux ont été créés pour gérer les commissions :

#### CommissionForm

Le composant `CommissionForm` permet de créer ou modifier une commission. Il gère :
- Le nom de la commission
- La spécialité 
- La description
- Une couleur personnalisée

Il utilise le hook `useForm` de React Hook Form avec la validation Yup.

Exemple d'utilisation :
```tsx
<CommissionForm 
  commission={selectedCommission} // Passer une commission existante pour le mode édition
  onSubmit={handleSubmit}
  isLoading={isPending}
/>
```

#### CommissionList

Le composant `CommissionList` affiche la liste des commissions sous forme de tableau avec des actions :
- Ajouter un membre
- Modifier la commission
- Supprimer la commission

Il inclut également une boîte de dialogue de confirmation pour la suppression.

Exemple d'utilisation :
```tsx
<CommissionList 
  commissions={commissions}
  onEdit={handleEdit}
  onAddMember={handleAddMember}
  isLoading={isLoading}
/>
```

#### CommissionMembers

Le composant `CommissionMembers` gère les membres d'une commission. Il permet de :
- Ajouter de nouveaux membres
- Modifier le rôle d'un membre
- Supprimer un membre

Il affiche la liste des membres sous forme de tableau et inclut un formulaire pour ajouter de nouveaux membres.

Exemple d'utilisation :
```tsx
<CommissionMembers 
  commission={selectedCommission}
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
/>
```

### Page principale

La page principale intègre tous ces composants et gère l'état global :

```tsx
export default function CommissionPage() {
  const { data: commissionsData, isLoading } = useCommissions();
  const commissions = commissionsData?.data || [];
  
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [canManageCommissions, setCanManageCommissions] = useState(false);
  
  const { mutate: createCommission, isPending: isCreating } = useCreateCommission();
  const { mutate: updateCommission, isPending: isUpdating } = useUpdateCommission(selectedCommission?.id);
  
  useEffect(() => {
    // Vérifier si l'utilisateur a le privilège de gérer les commissions
    const checkUserPrivilege = async () => {
      const hasPrivilege = await checkPrivilege(PrivilegeName.MANAGE_COMMISSIONS);
      setCanManageCommissions(hasPrivilege);
    };
    
    checkUserPrivilege();
  }, []);
  
  // ... Fonctions de gestion d'événements ...

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des commissions</h1>
        
        {canManageCommissions && (
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Créer une commission
          </Button>
        )}
      </div>
      
      <div className="space-y-6">
        {isFormOpen && canManageCommissions && (
          <CommissionForm 
            commission={selectedCommission || undefined}
            onSubmit={selectedCommission ? handleUpdateCommission : handleCreateCommission}
            isLoading={isCreating || isUpdating}
          />
        )}
        
        <CommissionList 
          commissions={commissions}
          onEdit={handleEditCommission}
          onAddMember={handleAddMember}
          isLoading={isLoading}
        />
        
        {selectedCommission && (
          <CommissionMembers 
            commission={selectedCommission}
            open={isMembersOpen}
            onOpenChange={setIsMembersOpen}
          />
        )}
      </div>
    </div>
  );
}
```

## Dépendances UI

Les composants utilisent les composants UI suivants qui doivent être disponibles dans le projet :

```typescript
// Composants de base
import { Button } from "@/components/ui/button";

// Composants de formulaire
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Composants de tableau
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Composants de dialogue et alerte
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Autres composants
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```

## Problèmes courants et solutions

Si vous rencontrez des erreurs TypeScript lors de l'intégration des composants, voici quelques solutions possibles :

### 1. Erreurs de type pour les utilisateurs

```typescript
// Problème
const users = usersData?.data?.users || [];
// Erreur: La propriété 'users' n'existe pas sur le type ...
```

Solution: Assurez-vous que l'API retourne bien un objet avec une propriété `users` ou ajustez le code pour correspondre à la structure retournée.

### 2. Erreurs de type pour les champs de formulaire

```typescript
render={({ field }) => (
  // Erreur: L'élément de liaison 'field' possède implicitement un type 'any'.
```

Solution: Ajoutez une annotation de type explicite pour les paramètres de render :

```typescript
render={({ field }: { field: any }) => (
```

### 3. Erreurs de validation de formulaire

```typescript
// Erreur avec le resolver yup
resolver: yupResolver(isEditMode ? CommissionUpdateSchema : CommissionSchema),
```

Solution: Assurez-vous que les types des schémas correspondent exactement aux types attendus par useForm.

### 4. Modules introuvables

```typescript
// Erreur: Impossible de localiser le module '@/components/ui/form'
import { Form } from "@/components/ui/form";
```

Solution: Vérifiez que ces composants UI existent dans votre projet. Si ce n'est pas le cas, vous devrez les créer ou utiliser une alternative.

## Conclusion

Le module de gestion des commissions permet de créer et gérer des groupes spécialisés au sein d'un établissement. Les utilisateurs peuvent être ajoutés à ces commissions avec des rôles spécifiques (président, secrétaire, etc.).

Cette implémentation suit l'architecture standard de l'application avec :
- Un modèle de données dans Prisma
- Des services backend pour la logique métier
- Des endpoints API REST
- Des hooks React Query pour l'état et les requêtes frontend
- Des composants React réutilisables