// src/app/api/upload/image/route.ts

import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import {
  handleApiError,
  HttpStatus,
  errorResponse,
  createdResponse,
} from "@/lib/services/api.service";
import {
  imageService,
  ImageStorageOptions,
} from "@/lib/services/image.service";
import { promises as fs } from "fs";
import path from "path";
import { Buffer } from "buffer";

// Type pour les objets File-like qu'on peut recevoir du client
interface FileLike {
  arrayBuffer?: () => Promise<ArrayBuffer>;
  name?: string;
  type?: string;
  filepath?: string;
  [key: string]: unknown; // Pour les autres propriétés qu'on pourrait rencontrer
}

// Cette fonction est nécessaire pour traiter les données multipart/form-data
async function parseForm(req: NextRequest) {
  // Créer un fichier temporaire pour stocker les données de la requête
  const tempDir = path.join(process.cwd(), "tmp");
  await fs.mkdir(tempDir, { recursive: true });

  const formData = await req.formData();

  // Extraire les données du formulaire
  const file = formData.get("file") as unknown as FileLike | null;
  const entityType = (formData.get("entityType") as string) || "general";
  const storagePath = formData.get("storagePath") as string;
  const fileId = formData.get("fileId") as string;
  const isUpdate = formData.get("isUpdate") === "true";

  let fileBuffer: Buffer | null = null;
  let fileType = "";

  // Traiter le fichier
  if (file) {
    try {
      if (typeof File !== "undefined" && file instanceof File) {
        // Dans un environnement de navigateur
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        fileType = file.type;
      } else if (file instanceof Blob) {
        // Si c'est un blob
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        fileType = file.type || "image/jpeg";
      } else if (typeof file === "object" && file !== null) {
        // Pour les autres types d'objets
        if (file.arrayBuffer && typeof file.arrayBuffer === "function") {
          const arrayBuffer = await file.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
          fileType = file.type || "image/jpeg";
        } else if (file.filepath) {
          // Pour les fichiers temporaires de formidable
          fileBuffer = await fs.readFile(file.filepath);
          fileType = file.type || "image/jpeg";
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'extraction du fichier:", error);
    }
  }

  return {
    file: fileBuffer,
    fileType,
    entityType,
    storagePath,
    fileId,
    isUpdate,
  };
}

// Route pour télécharger une image
export const POST = withPrivilege(
  PrivilegeName.UPLOAD_FILES,
  async (req: NextRequest) => {
    try {
      const { file, fileType, entityType, storagePath, fileId, isUpdate } =
        await parseForm(req);

      if (!file) {
        return errorResponse({
          feedback: "Aucun fichier valide trouvé",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // Vérifier que c'est bien une image
      if (!fileType.startsWith("image/")) {
        return errorResponse({
          feedback: "Le fichier doit être une image",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // Préparer le chemin de stockage complet
      const basePath = storagePath || `uploads/${entityType}`;
      const directory = `public/img/uploads/${basePath}`;

      console.log(`Chemin de stockage: ${directory}`);
      console.log(`Répertoire courant: ${process.cwd()}`);

      // Assurer que tous les dossiers existent
      try {
        const tempDir = path.join(process.cwd(), "tmp");
        await fs.mkdir(tempDir, { recursive: true });

        const publicDir = path.join(process.cwd(), "public");
        await fs.mkdir(publicDir, { recursive: true });
        console.log(`Répertoire public: ${publicDir}`);

        const publicImgDir = path.join(publicDir, "img");
        await fs.mkdir(publicImgDir, { recursive: true });
        console.log(`Répertoire img: ${publicImgDir}`);

        const uploadsDir = path.join(publicImgDir, "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });
        console.log(`Répertoire uploads: ${uploadsDir}`);

        const fullDirPath = path.join(process.cwd(), directory);
        await fs.mkdir(fullDirPath, { recursive: true });
        console.log(`Répertoire créé: ${fullDirPath}`);

        // Vérifier les permissions du dossier
        try {
          await fs.access(fullDirPath, fs.constants.W_OK);
          console.log(`Permissions d'écriture OK pour: ${fullDirPath}`);
        } catch (accessError) {
          console.error(
            `Pas de permission d'écriture pour: ${fullDirPath}`,
            accessError
          );
        }
      } catch (dirError) {
        console.error("Erreur lors de la création des répertoires:", dirError);
      }

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

      // Options de stockage
      const options: ImageStorageOptions = {
        directory,
        format: "webp" as const,
        quality: 80,
        fileId: fileId || undefined,
      };

      // Stocker l'image avec gestion des erreurs
      let result;
      try {
        console.log(`Tentative de stockage de l'image dans ${directory}`);
        result = await imageService.storeImage(file, options);
        console.log(`Image stockée avec succès: ${result.url}`);
      } catch (error) {
        console.error("Erreur critique lors du stockage de l'image:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur inconnue lors du stockage de l'image";

        return errorResponse({
          feedback:
            "Impossible de stocker l'image. Vérifiez les permissions du serveur.",
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: { error: errorMessage },
        });
      }

      // Créer des variantes
      let variants = {};
      try {
        variants = await imageService.createVariants(result.url, {
          thumbnail: { width: 100, height: 100 },
          medium: { width: 300, height: 300 },
        });
      } catch (variantError) {
        console.error(
          "Erreur lors de la création des variantes:",
          variantError
        );
        // Continuer même en cas d'erreur avec les variantes
      }

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
