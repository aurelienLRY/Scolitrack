// src/hooks/useImageUpload.ts

import { useState, useCallback } from "react";
import {
  ImageClientService,
  ImageResizeOptions,
} from "@/lib/services/image-client.service";
import FetchService from "@/lib/services/fetch.service";

/**
 * Interface pour la réponse de l'API d'upload d'image
 */
interface ImageUploadResponse {
  url: string;
  fileId?: string;
  variants?: Record<string, string>;
}

/**
 * Options pour le hook useImageUpload
 */
interface UseImageUploadOptions {
  entityType?: string;
  storagePath?: string;
  fileId?: string;
  onSuccess?: (data: ImageUploadResponse) => void;
  onError?: (error: Error) => void;
  clientOptions?: ImageResizeOptions;
}

/**
 * Hook pour gérer le téléchargement d'images vers le serveur
 *
 * Ce hook permet de télécharger des images, les optimiser côté client,
 * et les envoyer au serveur via une API dédiée.
 *
 * @param {UseImageUploadOptions} options - Options de configuration pour l'upload
 * @returns {Object} Méthodes et états pour gérer l'upload d'images
 *
 * @example
 * ```tsx
 * import { useImageUpload } from "@/hooks";
 *
 * function ProfileImageUploader() {
 *   const { uploadImage, isLoading, error } = useImageUpload({
 *     entityType: "user",
 *     storagePath: "profiles",
 *     onSuccess: (data) => {
 *       console.log("Image téléchargée:", data.url);
 *     }
 *   });
 *
 *   const handleFileChange = async (e) => {
 *     const file = e.target.files[0];
 *     if (file) {
 *       try {
 *         const result = await uploadImage(file);
 *         // Utiliser le résultat...
 *       } catch (err) {
 *         console.error("Erreur d'upload:", err);
 *       }
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input type="file" onChange={handleFileChange} />
 *       {isLoading && <p>Chargement en cours...</p>}
 *       {error && <p>Erreur: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Upload l'image directement
  const uploadImage = useCallback(
    async (file: File) => {
      if (!file) {
        throw new Error("Aucun fichier fourni pour l'upload");
      }

      setIsLoading(true);
      setError(null);

      try {
        // Préparer l'image côté client
        const { file: optimizedFile } = await ImageClientService.prepareImage(
          file,
          options.clientOptions
        );

        // Créer un FormData pour l'envoi
        const formData = new FormData();
        formData.append("file", optimizedFile);

        // Ajouter le type d'entité
        const entityType = options.entityType || "general";
        formData.append("entityType", entityType);

        // Ajouter le chemin de stockage s'il est fourni
        if (options.storagePath) {
          formData.append("storagePath", options.storagePath);
        }

        // Ajouter l'ID du fichier si c'est une mise à jour
        if (options.fileId) {
          formData.append("fileId", options.fileId);
          formData.append("isUpdate", "true");
        }

        // Envoyer au serveur
        const response = await FetchService.postFormData<ImageUploadResponse>(
          "/api/upload/image",
          formData
        );

        if (!response.success || !response.data) {
          throw new Error(response.feedback || "Erreur lors du téléchargement");
        }

        // Appeler le callback de succès
        if (options.onSuccess) {
          options.onSuccess(response.data);
        }

        return response.data;
      } catch (err) {
        console.error("Erreur d'upload:", err);
        const error =
          err instanceof Error
            ? err
            : new Error("Erreur lors du téléchargement");
        setError(error);
        if (options.onError) {
          options.onError(error);
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    uploadImage,
    isLoading,
    error,
  };
}
