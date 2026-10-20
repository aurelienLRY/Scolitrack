// src/app/api/upload/image/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { PrivilegeName } from "@/config/privileges.config";
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
import { v4 as uuidv4 } from "uuid";

interface FileLike {
  arrayBuffer?: () => Promise<ArrayBuffer>;
  name?: string;
  type?: string;
  filepath?: string;
  [key: string]: unknown;
}

async function parseForm(req: NextRequest) {
  const tempDir = path.join(process.cwd(), "tmp");
  await fs.mkdir(tempDir, { recursive: true });

  const formData = await req.formData();

  const file = formData.get("file") as unknown as FileLike | null;
  const entityType = (formData.get("entityType") as string) || "general";
  const storagePath = formData.get("storagePath") as string;
  const fileId = formData.get("fileId") as string;
  const isUpdate = formData.get("isUpdate") === "true";

  let fileBuffer: Buffer | null = null;
  let fileType = "";

  if (file) {
    try {
      if (typeof File !== "undefined" && file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        fileType = file.type;
      } else if (file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        fileType = file.type || "image/jpeg";
      } else if (typeof file === "object" && file !== null) {
        if (file.arrayBuffer && typeof file.arrayBuffer === "function") {
          const arrayBuffer = await file.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
          fileType = file.type || "image/jpeg";
        } else if (file.filepath) {
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

/**
 * Upload d'image vers storage/images/.
 * - UPLOAD_FILES (ou SUPER_ADMIN) : tous les dossiers
 * - Utilisateur authentifié sans ce privilège : uniquement avatars (users/)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      );
    }

    const { file, fileType, entityType, storagePath, fileId, isUpdate } =
      await parseForm(req);

    const requestedDir = (storagePath || entityType || "general")
      .replace(/\\/g, "/")
      .replace(/^public\//, "")
      .replace(/^img\/uploads\//, "")
      .replace(/^storage\/images\//, "")
      .replace(/^[/\\]+/, "");

    const isPersonalAvatar =
      requestedDir === "users" || entityType === "user";

    const hasUploadPrivilege =
      session.user.roleName === "SUPER_ADMIN" ||
      session.user.privileges?.includes(PrivilegeName.UPLOAD_FILES);

    if (!hasUploadPrivilege && !isPersonalAvatar) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Sans privilège upload : forcer le dossier users (anti escalade)
    const directory = hasUploadPrivilege ? requestedDir : "users";

    if (!file) {
      return errorResponse({
        feedback: "Aucun fichier valide trouvé",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (!fileType.startsWith("image/")) {
      return errorResponse({
        feedback: "Le fichier doit être une image",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const oldFileId = isUpdate && fileId ? fileId : null;
    const newFileId = `img_${uuidv4()}`;

    const options: ImageStorageOptions = {
      directory,
      format: "webp" as const,
      quality: 80,
      fileId: newFileId,
    };

    let result;
    try {
      result = await imageService.storeImage(file, options);

      if (oldFileId) {
        imageService
          .deleteImageByFileId(oldFileId)
          .then(() =>
            console.log(`Image précédente supprimée (fileId: ${oldFileId})`)
          )
          .catch((err) =>
            console.warn(
              `Nettoyage ultérieur programmé pour le fichier ${oldFileId}:`,
              err
            )
          );
      }
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
    }

    return createdResponse({
      data: {
        url: result.url,
        storagePath: result.storagePath,
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
