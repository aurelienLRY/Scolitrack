# Guide d'Implémentation du Système d'Upload d'Images pour Scolitrack

Ce guide explique comment utiliser et étendre le système d'upload et de traitement d'images mis en place dans le projet Scolitrack.

## 1. Vue d'ensemble

Le système d'upload d'images de Scolitrack permet de :

- Optimiser les images côté client avant leur envoi au serveur
- Traiter, redimensionner et convertir automatiquement les images au format WebP
- Créer des variantes d'images à différentes résolutions
- Gérer les mises à jour d'images avec suppression des anciennes versions
- Organiser les fichiers dans une structure de dossiers cohérente

## 2. Architecture du système

Le système repose sur trois composants principaux :

1. **Service client** (`image-client.service.ts`) : prépare et optimise les images côté client
2. **Hook React** (`useImageUpload.ts`) : facilite l'utilisation du système d'upload dans les composants
3. **Service serveur** (`image.service.ts`) : gère le stockage, le traitement et les variantes d'images
4. **Route API** (`route.ts`) : expose un endpoint pour l'upload des images

```plaintext
src/
├── lib/
│   └── services/
│       ├── image-client.service.ts  # Service côté client pour optimisation des images
│       └── image.service.ts         # Service côté serveur pour stockage et traitement
├── hooks/
│   └── useImageUpload.ts            # Hook React pour faciliter l'upload
└── app/
    └── api/
        └── upload/
            └── image/
                └── route.ts         # Endpoint API pour l'upload des images
```

## 3. Service Client (Préparation des Images)

Le service client (`image-client.service.ts`) est responsable de l'optimisation des images avant leur envoi au serveur :

```typescript
export class ImageClientService {
  static async prepareImage(
    file: File,
    options: ImageResizeOptions = {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format: "webp",
    }
  ): Promise<{ file: File; preview: string }> {
    // Redimensionnement et compression de l'image
    // ...
  }

  static revokePreview(preview: string): void {
    URL.revokeObjectURL(preview);
  }
}
```

### Fonctionnalités clés :

1. **Redimensionnement préservant le ratio** : ajuste la taille des images tout en maintenant leurs proportions
2. **Compression intelligente** : réduit la taille des fichiers sans perte significative de qualité
3. **Conversion de format** : transforme les images au format WebP pour un meilleur rapport qualité/taille
4. **Génération de prévisualisations** : crée des URLs de prévisualisation pour affichage immédiat
5. **Gestion de la mémoire** : libère les ressources après utilisation avec `revokePreview`

## 4. Hook React pour l'Upload d'Images

Le hook `useImageUpload` facilite l'intégration du système d'upload dans les composants React :

```typescript
export function useImageUpload(options: UseImageUploadOptions = {}): object {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadImage = useCallback(
    async (file: File) => {
      // Logique d'upload avec optimisation client et envoi au serveur
      // ...
    },
    [options]
  );

  return {
    uploadImage,
    isLoading,
    error,
  };
}
```

### Options du hook :

| Option          | Type       | Description                                              |
| --------------- | ---------- | -------------------------------------------------------- |
| `entityType`    | `string`   | Type d'entité associée à l'image (ex: "user", "patient") |
| `storagePath`   | `string`   | Chemin de stockage personnalisé                          |
| `fileId`        | `string`   | ID d'un fichier existant pour mise à jour                |
| `onSuccess`     | `function` | Callback appelé après un upload réussi                   |
| `onError`       | `function` | Callback appelé en cas d'erreur                          |
| `clientOptions` | `object`   | Options de redimensionnement et compression              |

### Exemple d'utilisation :

```tsx
import { useImageUpload } from "@/hooks";

function ProfileImageUploader() {
  const { uploadImage, isLoading, error } = useImageUpload({
    entityType: "user",
    storagePath: "profiles",
    onSuccess: (data) => {
      // Utiliser l'URL de l'image téléchargée
      console.log("Image uploadée:", data.url);

      // Accéder aux variantes
      console.log("Thumbnail:", data.variants.thumbnail);
    },
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const result = await uploadImage(file);
        // Traiter le résultat
      } catch (err) {
        console.error("Erreur d'upload:", err);
      }
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {isLoading && <p>Chargement en cours...</p>}
      {error && <p>Erreur: {error.message}</p>}
    </div>
  );
}
```

## 5. Service Serveur pour le Traitement d'Images

Le service serveur (`image.service.ts`) est responsable du traitement, du stockage et de la gestion des images :

```typescript
export const imageService = {
  // Stocke une image et renvoie son URL et son ID
  async storeImage(
    file: File | Buffer,
    options: ImageStorageOptions = {}
  ): Promise<ImageStorageResult> {
    // Logique de stockage et traitement
    // ...
  },

  // Supprime une image par son URL
  async deleteImage(url: string): Promise<boolean> {
    // ...
  },

  // Supprime une image par son fileId
  async deleteImageByFileId(fileId: string): Promise<boolean> {
    // ...
  },

  // Cherche et supprime les fichiers par préfixe
  async findAndDeleteFilesByPrefix(
    directory: string,
    prefix: string
  ): Promise<boolean> {
    // ...
  },

  // Crée des variantes redimensionnées d'une image
  async createVariants(
    imageUrl: string,
    variants: {
      [key: string]: { width: number; height?: number; fit?: string };
    }
  ): Promise<Record<string, string>> {
    // ...
  },
};
```

### Fonctionnalités clés :

1. **Traitement avancé des images** :

   - Utilisation de la bibliothèque `sharp` pour des opérations rapides et optimisées
   - Conversion au format WebP pour un meilleur ratio qualité/taille
   - Redimensionnement intelligent avec préservation du ratio

2. **Gestion du stockage** :

   - Organisation en dossiers par type d'entité
   - Création automatique des répertoires nécessaires
   - Nommage unique des fichiers avec UUIDs préfixés

3. **Génération de variantes** :

   - Création automatique de différentes tailles d'images (thumbnail, medium)
   - Nommage cohérent des variantes (`original_variant.ext`)
   - Retourne les URLs de toutes les variantes

4. **Gestion des mises à jour** :
   - Suppression des anciennes images lors des mises à jour
   - Identification par fileId pour retrouver les fichiers associés
   - Nettoyage des variantes lors de la suppression d'une image

## 6. Route API pour l'Upload

La route API (`route.ts`) expose un endpoint pour l'upload des images :

```typescript
export const POST = withPrivilege("UPLOAD_FILES", async (req: NextRequest) => {
  // Extraction des données du formulaire
  // Vérification du type de fichier
  // Suppression des anciennes images si nécessaire
  // Stockage et traitement de l'image
  // Création des variantes
  // Retour de la réponse
});
```

### Caractéristiques de la route :

1. **Sécurité** :

   - Protection par système de privilèges (`withPrivilege`)
   - Validation du type de fichier (uniquement des images)
   - Gestion des erreurs avec réponses appropriées

2. **Paramètres acceptés** :

   - `file` : Le fichier image à télécharger
   - `entityType` : Type d'entité associée (par défaut: "general")
   - `storagePath` : Chemin de stockage personnalisé
   - `fileId` : ID d'un fichier existant pour mise à jour
   - `isUpdate` : Indique s'il s'agit d'une mise à jour

3. **Réponse** :
   ```json
   {
     "success": true,
     "data": {
       "url": "/img/uploads/profiles/img_12345.webp",
       "fileId": "img_12345",
       "variants": {
         "thumbnail": "/img/uploads/profiles/img_12345_thumbnail.webp",
         "medium": "/img/uploads/profiles/img_12345_medium.webp"
       }
     },
     "feedback": "Image téléchargée avec succès"
   }
   ```

## 7. Intégration avec React-Hook-Form

Le composant `FileUpload` peut être intégré avec React-Hook-Form pour une gestion facile des formulaires :

```tsx
import { useFormContext } from "react-hook-form";
import { useImageUpload } from "@/hooks";

function FormWithImageUpload() {
  const { register, setValue, watch } = useFormContext();
  const logoUrl = watch("logoUrl");
  const logoFileId = watch("logoFileId");

  const { uploadImage, isLoading } = useImageUpload({
    entityType: "establishment",
    storagePath: "logos",
    fileId: logoFileId,
    onSuccess: (data) => {
      setValue("logoUrl", data.url);
      setValue("logoFileId", data.fileId);
    },
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadImage(file);
    }
  };

  return (
    <form>
      <div>
        <label>Logo</label>
        <input type="file" onChange={handleFileChange} />
        {isLoading && <p>Chargement...</p>}
        {logoUrl && <img src={logoUrl} alt="Logo" width={100} />}

        {/* Champs cachés pour stocker les données */}
        <input type="hidden" {...register("logoUrl")} />
        <input type="hidden" {...register("logoFileId")} />
      </div>

      {/* Autres champs du formulaire */}
    </form>
  );
}
```

## 8. Exemples d'utilisation

### Exemple 1: Upload simple d'image

```tsx
function SimpleImageUploader() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { uploadImage, isLoading } = useImageUpload();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await uploadImage(file);
      setImageUrl(result.url);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {isLoading && <p>Chargement...</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
}
```

### Exemple 2: Gestion d'avatar d'utilisateur (avec mise à jour)

```tsx
function UserAvatar({ userId, currentAvatar, fileId }) {
  const { uploadImage, isLoading } = useImageUpload({
    entityType: "user",
    storagePath: `avatars/${userId}`,
    fileId: fileId,
    onSuccess: (data) => {
      // Mettre à jour le profil utilisateur avec la nouvelle image
      updateUserProfile(userId, {
        avatarUrl: data.url,
        avatarFileId: data.fileId,
      });
    },
  });

  return (
    <div className="avatar-uploader">
      {currentAvatar ? (
        <img src={currentAvatar} alt="Avatar" className="current-avatar" />
      ) : (
        <div className="avatar-placeholder">
          <UserIcon />
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        id="avatar-upload"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file);
        }}
      />

      <label htmlFor="avatar-upload" className="upload-button">
        {isLoading ? "Chargement..." : "Modifier"}
      </label>
    </div>
  );
}
```

### Exemple 3: Galerie d'images pour un patient

```tsx
function PatientImageGallery({ patientId }) {
  const [images, setImages] = useState([]);

  const { uploadImage, isLoading } = useImageUpload({
    entityType: "patient",
    storagePath: `patients/${patientId}/gallery`,
    onSuccess: (data) => {
      // Ajouter la nouvelle image à la galerie
      setImages((prev) => [
        ...prev,
        {
          id: data.fileId,
          url: data.url,
          thumbnail: data.variants.thumbnail,
        },
      ]);

      // Sauvegarder en base de données
      savePatientImage(patientId, {
        imageUrl: data.url,
        fileId: data.fileId,
        variants: data.variants,
      });
    },
  });

  return (
    <div className="gallery">
      <div className="image-grid">
        {images.map((image) => (
          <div key={image.id} className="image-item">
            <img
              src={image.thumbnail}
              alt=""
              onClick={() => showFullImage(image.url)}
            />
          </div>
        ))}

        <div className="upload-new">
          <input
            type="file"
            accept="image/*"
            id="gallery-upload"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
            }}
          />

          <label htmlFor="gallery-upload" className="upload-button">
            {isLoading ? <Spinner /> : <PlusIcon />}
          </label>
        </div>
      </div>
    </div>
  );
}
```

## 9. Limites et considérations

### Limitations techniques

1. **Taille des fichiers** :

   - La taille maximale des fichiers est limitée par la configuration de Next.js et de votre serveur
   - Pour les fichiers volumineux, envisagez d'ajouter un système de téléchargement par parties (chunked upload)

2. **Types de fichiers** :

   - Le système est optimisé pour les formats d'image courants (JPEG, PNG, WebP)
   - D'autres formats peuvent nécessiter des modifications du code

3. **Performance du navigateur** :
   - Le prétraitement côté client peut être intensif pour les très grandes images
   - Envisagez d'ajouter une validation de taille avant le traitement

### Considérations de sécurité

1. **Validation des fichiers** :

   - Vérifiez toujours que le fichier est bien une image (type MIME)
   - Limitez les tailles maximales acceptées

2. **Privilèges** :

   - L'endpoint d'API est protégé par le système de privilèges (`UPLOAD_FILES`)
   - Assurez-vous que seuls les utilisateurs autorisés peuvent télécharger des images

3. **Stockage des fichiers** :
   - Les images sont stockées dans le dossier `public/img/uploads`
   - Ce dossier doit être exclu des dépôts Git (via `.gitignore`)
   - En production, envisagez d'utiliser un service de stockage externe (S3, etc.)

## 10. Extension du système

### Ajout de nouveaux formats d'image

Pour ajouter le support d'autres formats d'image :

1. Modifiez `image-client.service.ts` pour accepter le nouveau format :

```typescript
export interface ImageResizeOptions {
  // ...
  format?: "jpeg" | "png" | "webp" | "avif"; // Ajout du format AVIF
}
```

2. Mettez à jour la logique de conversion dans le service client et serveur

### Intégration avec un service de stockage cloud

Pour utiliser un service comme AWS S3 ou Cloudinary :

1. Installez les bibliothèques nécessaires :

```bash
npm install @aws-sdk/client-s3
```

2. Créez un service de stockage alternatif :

```typescript
// src/lib/services/cloud-storage.service.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const cloudStorageService = {
  async uploadToS3(buffer: Buffer, key: string) {
    const client = new S3Client({ region: process.env.AWS_REGION });
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/webp",
    });

    await client.send(command);
    return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
  },
};
```

3. Modifiez `image.service.ts` pour utiliser ce service

### Amélioration des performances

Pour optimiser les performances d'upload :

1. Ajoutez un système de mise en cache des images :

```typescript
import { cache } from "react";

export const getCachedImage = cache(async (url: string) => {
  // Logique pour récupérer l'image avec mise en cache
});
```

2. Implémentez un système de téléchargement direct vers le stockage cloud (signed URLs)

## 11. Résumé et bonnes pratiques

### Résumé

1. **Architecture complète** :

   - Service client pour optimisation avant envoi
   - Hook React pour intégration facile dans les composants
   - Service serveur pour traitement et stockage
   - Route API sécurisée

2. **Fonctionnalités** :
   - Optimisation des images (redimensionnement et compression)
   - Conversion au format WebP
   - Création automatique de variantes
   - Gestion des mises à jour avec suppression des anciennes versions

### Bonnes pratiques

1. **Performances** :

   - Redimensionnez toujours les images avant upload
   - Utilisez WebP pour un meilleur ratio qualité/taille
   - Créez des variantes adaptées à différents usages

2. **Stockage** :

   - Organisez les images par type d'entité et usage
   - Utilisez des identifiants uniques pour éviter les conflits
   - Synchronisez les chemins entre client et serveur

3. **Expérience utilisateur** :

   - Affichez des prévisualisations immédiatement après sélection
   - Indiquez clairement l'état de chargement
   - Gérez correctement les erreurs et retours utilisateur

4. **Sécurité** :
   - Validez toujours le type et la taille des fichiers
   - Utilisez le système de privilèges pour contrôler les accès
   - Ne stockez jamais de noms de fichiers sensibles ou personnels
