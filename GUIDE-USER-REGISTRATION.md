# Guide de Gestion des Utilisateurs pour Scolitrack

Ce guide explique comment utiliser et étendre les fonctionnalités de gestion des utilisateurs dans le projet Scolitrack, notamment l'inscription, l'activation de compte et la gestion des utilisateurs.

## 1. Structure des Fichiers

```plaintext
src/
├── app/
│   ├── (auth)/
│   │   └── activate-account/
│   │       └── page.tsx               # Page d'activation de compte
│   └── private/
│       └── admin/
│           └── users/
│               └── page.tsx           # Page d'administration des utilisateurs
├── components/
│   └── users/
│       ├── create-user-form.tsx       # Formulaire de création d'utilisateur
│       ├── activate-account-form.tsx  # Formulaire d'activation de compte
│       └── user-list.tsx              # Liste des utilisateurs
├── schemas/
│   └── UserSchema.ts                 # Validation des formulaires utilisateur
├── lib/
│   ├── auth/
│   │   ├── auth.ts                   # Configuration de l'authentification
│   │   ├── auth.config.ts            # Configuration NextAuth
│   │   ├── auth.middleware.ts        # Middleware pour vérifier les autorisations
│   │   └── user.service.ts           # Services de gestion des utilisateurs
│   └── nodemailer/
│       ├── account-activation.email.ts # Template d'email d'activation
│       └── transporter.nodemailer.ts   # Configuration de l'envoi d'emails
└── app/
    └── api/
        └── users/
            ├── route.ts              # API de création et listage d'utilisateurs
            └── activate/
                └── route.ts          # API d'activation de compte
```

## 2. Fonctionnalités Disponibles

Le système de gestion des utilisateurs offre les fonctionnalités suivantes :

1. **Création d'utilisateurs** par un administrateur
2. **Invitation par email** avec lien d'activation
3. **Activation de compte** avec définition du mot de passe
4. **Affichage et pagination** des utilisateurs existants
5. **Gestion des rôles** (SUPER_ADMIN, ADMIN, TEACHER, USER)
6. **Validation des données** avec schémas Yup
7. **Contrôle d'accès** basé sur les rôles

## 3. Flux d'Utilisation

### 3.1 Création d'un Nouveau Compte

Le flux de création et d'activation d'un compte utilisateur se déroule comme suit :

1. **Administrateur crée un utilisateur**

   - Se connecte à l'interface d'administration `/private/admin/users`
   - Remplit le formulaire avec nom, email et rôle
   - Soumet le formulaire

2. **Système envoie un email d'invitation**

   - Génère un token d'activation unique (UUID)
   - Envoie un email avec lien d'activation à l'utilisateur

3. **Utilisateur active son compte**

   - Clique sur le lien reçu par email
   - Est redirigé vers `/(auth)/activate-account?token=[TOKEN]`
   - Définit son mot de passe
   - Confirme et active son compte

4. **Utilisateur peut se connecter**
   - Utilise son email et le mot de passe défini
   - Accède à l'application selon son rôle

## 4. Composants et Services

### 4.1 Formulaires

#### CreateUserForm

Le composant `CreateUserForm` permet aux administrateurs de créer de nouveaux utilisateurs :

```tsx
import CreateUserForm from "@/components/users/create-user-form";

<CreateUserForm />;
```

Options du formulaire :

- **Name** : Nom complet de l'utilisateur
- **Email** : Adresse email (unique)
- **Role** : Rôle de l'utilisateur (USER, TEACHER, ADMIN, SUPER_ADMIN)

#### ActivateAccountForm

Le composant `ActivateAccountForm` permet aux utilisateurs d'activer leur compte :

```tsx
import ActivateAccountForm from "@/components/users/activate-account-form";

<ActivateAccountForm />;
```

Champs du formulaire :

- **Password** : Mot de passe (min. 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux)
- **ConfirmPassword** : Confirmation du mot de passe
- **Token** : Token d'activation (caché, récupéré de l'URL)

### 4.2 Services

#### UserService

Le service `user.service.ts` fournit les fonctions pour gérer les utilisateurs :

```typescript
import { createUser, activateAccount, getUsers } from "@/lib/auth/user.service";

// Créer un utilisateur
const newUser = await createUser({
  name: "John Doe",
  email: "john@example.com",
  role: "USER",
});

// Activer un compte
const activatedUser = await activateAccount(token, password);

// Récupérer la liste des utilisateurs
const { users, pagination } = await getUsers(page, limit);
```

#### Email Service

Le service d'email permet d'envoyer des emails d'invitation :

```typescript
import { sendAccountActivationEmail } from "@/lib/nodemailer/account-activation.email";

await sendAccountActivationEmail(email, name, token);
```

## 5. API Endpoints

### 5.1 Création d'Utilisateur

**Endpoint**: `POST /api/users`

**Authentification**: Requise (Admin uniquement)

**Corps de la requête**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

**Réponse**:

```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": "cks5a8z9k0000qwzf3j8j8j8j",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2023-01-01T12:00:00.000Z"
  }
}
```

### 5.2 Activation de Compte

**Endpoint**: `POST /api/users/activate`

**Authentification**: Non requise

**Corps de la requête**:

```json
{
  "token": "uuid-token-from-email",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

**Réponse**:

```json
{
  "message": "Compte activé avec succès",
  "user": {
    "id": "cks5a8z9k0000qwzf3j8j8j8j",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### 5.3 Liste des Utilisateurs

**Endpoint**: `GET /api/users?page=1&limit=10`

**Authentification**: Requise (Admin uniquement)

**Paramètres**:

- `page` (optionnel): Numéro de page (défaut: 1)
- `limit` (optionnel): Éléments par page (défaut: 10)

**Réponse**:

```json
{
  "users": [
    {
      "id": "cks5a8z9k0000qwzf3j8j8j8j",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "emailVerified": "2023-01-01T12:00:00.000Z",
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T12:00:00.000Z"
    }
    // Plus d'utilisateurs...
  ],
  "pagination": {
    "total": 25,
    "pages": 3,
    "page": 1,
    "limit": 10
  }
}
```

## 6. Sécurité et Bonnes Pratiques

### 6.1 Validation des Données

Toutes les entrées utilisateur sont validées avec des schémas Yup :

```typescript
const CreateUserSchema = yup.object().shape({
  name: yup.string().required("Nom complet requis"),
  email: yup.string().email("Email invalide").required("Email requis"),
  role: yup
    .string()
    .oneOf(Object.values(UserRole), "Rôle invalide")
    .required("Rôle requis"),
});
```

### 6.2 Contrôle d'Accès

Les middleware d'authentification vérifient les permissions :

```typescript
// Vérifier si l'utilisateur est administrateur
const authError = await isAdmin();
if (authError) return authError;

// Vérifier un rôle spécifique
const authError = await hasRole([UserRole.TEACHER]);
if (authError) return authError;
```

### 6.3 Stockage Sécurisé des Mots de Passe

Les mots de passe sont hachés avec bcrypt avant stockage :

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

## 7. Personnalisation

### 7.1 Modification du Template d'Email

Pour personnaliser l'email d'invitation, modifiez `src/lib/nodemailer/account-activation.email.ts` :

```typescript
// Personnaliser le sujet de l'email
subject: "Bienvenue sur Scolitrack - Activez votre compte",

// Personnaliser le contenu HTML
html: `
  <div style="...">
    <h1>Bienvenue sur Scolitrack !</h1>
    <!-- Personnalisez le contenu ici -->
  </div>
`,
```

### 7.2 Ajouter des Champs Utilisateur

Pour ajouter des champs supplémentaires au modèle utilisateur :

1. Mettez à jour le modèle Prisma dans `prisma/schema.prisma` :

   ```prisma
   model User {
     // Champs existants...
     phone          String?   // Nouveau champ
     department     String?   // Nouveau champ
     // ...
   }
   ```

2. Exécutez une migration Prisma :

   ```bash
   npx prisma migrate dev --name add_user_fields
   ```

3. Mettez à jour les schémas de validation dans `src/schemas/UserSchema.ts`

4. Mettez à jour les formulaires et les services

### 7.3 Modification des Règles de Mot de Passe

Pour modifier les exigences de mot de passe, mettez à jour le schéma dans `src/schemas/UserSchema.ts` :

```typescript
password: yup
  .string()
  .required("Mot de passe requis")
  .min(6, "Le mot de passe doit contenir au moins 6 caractères") // Moins strict
  // Modifier le regex pour les exigences
  .matches(/^(?=.*[a-z])(?=.*[0-9])/,
    "Le mot de passe doit contenir au moins une lettre minuscule et un chiffre"
  ),
```

## 8. Résolution des Problèmes Courants

### 8.1 L'Email d'Activation n'Arrive Pas

1. Vérifiez la configuration SMTP dans `.env` :

   ```
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_username
   SMTP_PASSWORD=your_password
   SMTP_FROM=noreply@example.com
   ```

2. Vérifiez les logs serveur pour les erreurs d'envoi d'email
3. Vérifiez les dossiers spam/indésirables du destinataire
4. Assurez-vous que l'adresse email de l'utilisateur est correcte

### 8.2 Erreur lors de l'Activation du Compte

1. Vérifiez que le token d'activation est valide et n'a pas expiré
2. Assurez-vous que le token complet est inclus dans l'URL
3. Vérifiez que l'utilisateur n'a pas déjà activé son compte
4. Inspectez les logs serveur pour plus de détails sur l'erreur

### 8.3 Problèmes d'Autorisation

1. Vérifiez que l'utilisateur a le rôle approprié
2. Assurez-vous que le token JWT est valide et n'a pas expiré
3. Vérifiez les callbacks NextAuth dans `auth.config.ts`

## 9. Variables d'Environnement

Les variables d'environnement requises pour le système d'enregistrement :

```
# Base de données
DATABASE_URL=mysql://user:password@localhost:3306/scolitrack

# NextAuth
AUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# SMTP pour les emails
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASSWORD=your_password
SMTP_FROM=noreply@example.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Scolitrack
```

## 10. Extension du Système

### 10.1 Ajout d'une Confirmation par SMS

Pour ajouter une confirmation par SMS en plus de l'email :

1. Ajoutez une dépendance pour un service SMS (Twilio, Nexmo, etc.)
2. Créez un service d'envoi de SMS dans `src/lib/sms/`
3. Intégrez le service dans le processus de création d'utilisateur

### 10.2 Importation en Masse d'Utilisateurs

Pour ajouter une fonctionnalité d'importation CSV d'utilisateurs :

1. Créez un composant de téléchargement de fichier
2. Créez un endpoint API pour traiter le fichier
3. Ajoutez une logique de validation et de création en masse

### 10.3 Auto-Inscription

Pour permettre l'auto-inscription (sans administrateur) :

1. Créez un formulaire d'inscription publique
2. Ajoutez une page d'inscription accessible publiquement
3. Modifiez le service utilisateur pour permettre l'inscription avec validation d'email

## 11. Ressources et Documentation

- [Documentation NextAuth.js](https://next-auth.js.org/)
- [Documentation Prisma](https://www.prisma.io/docs/)
- [Documentation Nodemailer](https://nodemailer.com/about/)
- [Documentation Yup](https://github.com/jquense/yup)
- [Guide des meilleures pratiques de sécurité OWASP](https://owasp.org/www-project-top-ten/)
