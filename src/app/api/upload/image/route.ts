// src/app/api/upload/image/route.ts

import { NextRequest } from "next/server";
import {
  imageService,
  ImageStorageOptions,
} from "@/lib/services/image.service";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import {
  handleApiError,
  HttpStatus,
  errorResponse,
  createdResponse,
} from "@/lib/services/api.service";

// Route pour télécharger une image
export const POST = withPrivilege(
  PrivilegeName.UPLOAD_FILES, // Vous pouvez ajuster selon vos privilèges existants
  async (req: NextRequest) => {
    try {
      const formData = await req.formData();
      const file = formData.get("file");
      const entityType = (formData.get("entityType") as string) || "general";
      const storagePath = formData.get("storagePath") as string;
      const fileId = formData.get("fileId") as string;
      const isUpdate = formData.get("isUpdate") === "true";

      if (!file || !(file instanceof File)) {
        return errorResponse({
          feedback: "Aucun fichier trouvé",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        return errorResponse({
          feedback: "Le fichier doit être une image",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // Préparer le chemin de stockage complet
      const basePath = storagePath || `uploads/${entityType}`;
      const directory = `public/img/uploads/${basePath}`;

      // S'il s'agit d'une mise à jour, supprimer l'ancienne image
      if (isUpdate && fileId) {
        try {
          await imageService.deleteImageByFileId(fileId);
          console.log(`Image précédente supprimée (fileId: ${fileId})`);
        } catch (error) {
          console.warn(`Impossible de supprimer l'image précédente:`, error);
          // Continuer le processus même si la suppression échoue
        }
      }

      // Options de stockage selon le type d'entité
      const options: ImageStorageOptions = {
        directory,
        format: "webp" as const,
        quality: 80,
        fileId: fileId || undefined,
      };

      // Stocker l'image
      const result = await imageService.storeImage(file, options);

      // Créer des variantes
      const variants = await imageService.createVariants(result.url, {
        thumbnail: { width: 100, height: 100 },
        medium: { width: 300, height: 300 },
      });

      return createdResponse({
        data: {
          url: result.url,
          variants,
          fileId: result.fileId,
        },
        feedback: isUpdate
          ? "Image mise à jour avec succès"
          : "Image téléchargée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image:", error);
      return handleApiError(error, "Erreur lors du téléchargement de l'image");
    }
  }
);
