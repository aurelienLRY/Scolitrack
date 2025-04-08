// src/lib/services/image.service.ts

import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export interface ImageStorageOptions {
  directory?: string;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill";
  fileId?: string; // ID du fichier pour les mises à jour
}

interface ImageStorageResult {
  url: string;
  fileId: string;
  filePath: string;
}

const FILE_ID_PREFIX = "img_";

export const imageService = {
  /**
   * Stocke une image téléchargée et renvoie son URL et son ID
   */
  async storeImage(
    file: File | Buffer,
    options: ImageStorageOptions = {}
  ): Promise<ImageStorageResult> {
    const {
      directory = "public/uploads",
      quality = 80,
      format = "webp",
      width,
      height,
      fit = "cover",
      fileId = `${FILE_ID_PREFIX}${uuidv4()}`,
    } = options;

    // Créer le dossier s'il n'existe pas
    await fs.mkdir(directory, { recursive: true });

    // Générer un nom de fichier basé sur l'ID du fichier
    const filename = `${fileId}.${format}`;
    const fullPath = path.join(process.cwd(), directory, filename);

    // Convertir le fichier en buffer
    let buffer: Buffer;
    if (file instanceof Buffer) {
      buffer = file;
    } else {
      // Pour un objet File
      if ("arrayBuffer" in file) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        // Si c'est un autre type avec des données binaires
        throw new Error("Format de fichier non pris en charge");
      }
    }

    // Traiter l'image avec Sharp
    let sharpInstance = sharp(buffer);

    // Redimensionner si nécessaire
    if (width || height) {
      sharpInstance = sharpInstance.resize({
        width,
        height,
        fit,
        withoutEnlargement: true,
      });
    }

    // Convertir au format souhaité avec la qualité spécifiée
    if (format === "webp") {
      sharpInstance = sharpInstance.webp({ quality });
    } else if (format === "jpeg") {
      sharpInstance = sharpInstance.jpeg({ quality });
    } else if (format === "png") {
      sharpInstance = sharpInstance.png({ quality });
    }

    // Sauvegarder l'image traitée
    await sharpInstance.toFile(fullPath);

    // Calculer l'URL relative pour accéder à l'image
    const relativePath = directory.replace(/^public\//, "/");
    const url = `${relativePath}/${filename}`;

    // Retourner les informations sur l'image stockée
    return {
      url,
      fileId,
      filePath: fullPath,
    };
  },

  /**
   * Supprime une image en fonction de son URL
   */
  async deleteImage(url: string): Promise<boolean> {
    if (!url) return false;

    try {
      const filePath = path.join(process.cwd(), "public", url);
      await fs.unlink(filePath);

      // Vérifier si des variantes existent et les supprimer aussi
      const dir = path.dirname(filePath);
      const filename = path.basename(filePath);
      const baseFilename = path.parse(filename).name;
      const extension = path.parse(filename).ext;

      // Lister les fichiers du répertoire
      const files = await fs.readdir(dir);

      // Supprimer toutes les variantes associées
      const variantPromises = files
        .filter(
          (file) =>
            file.startsWith(`${baseFilename}_`) && file.endsWith(extension)
        )
        .map((file) => fs.unlink(path.join(dir, file)));

      await Promise.all(variantPromises);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
      return false;
    }
  },

  /**
   * Supprime une image en fonction de son fileId
   */
  async deleteImageByFileId(fileId: string): Promise<boolean> {
    if (!fileId) return false;

    try {
      // Rechercher les fichiers qui commencent par ce fileId dans les répertoires uploads
      const uploadsDir = path.join(process.cwd(), "public/uploads");
      const allFilesDeleted = await this.findAndDeleteFilesByPrefix(
        uploadsDir,
        fileId
      );
      return allFilesDeleted;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de l'image avec fileId ${fileId}:`,
        error
      );
      return false;
    }
  },

  /**
   * Cherche et supprime les fichiers commençant par un préfixe spécifique
   */
  async findAndDeleteFilesByPrefix(
    directory: string,
    prefix: string
  ): Promise<boolean> {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      let deleted = false;

      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
          // Si c'est un dossier, chercher récursivement à l'intérieur
          const result = await this.findAndDeleteFilesByPrefix(
            fullPath,
            prefix
          );
          deleted = deleted || result;
        } else if (
          entry.isFile() &&
          path.parse(entry.name).name.startsWith(prefix)
        ) {
          // Si c'est un fichier qui commence par le préfixe, le supprimer
          await fs.unlink(fullPath);
          deleted = true;
        }
      }

      return deleted;
    } catch (error) {
      console.error(
        "Erreur lors de la recherche et suppression de fichiers:",
        error
      );
      return false;
    }
  },

  /**
   * Crée des versions redimensionnées d'une image pour différents usages
   */
  async createVariants(
    imageUrl: string,
    variants: {
      [key: string]: {
        width: number;
        height?: number;
        fit?: "cover" | "contain";
      };
    }
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const sourceFilePath = path.join(process.cwd(), "public", imageUrl);

    try {
      // Vérifier que le fichier source existe
      await fs.access(sourceFilePath);

      for (const [name, config] of Object.entries(variants)) {
        const { width, height, fit = "cover" } = config;

        // Créer un nouveau nom de fichier pour la variante
        const extension = path.extname(imageUrl);
        const basename = path.basename(imageUrl, extension);
        const variantFilename = `${basename}_${name}${extension}`;
        const variantPath = path.join(
          path.dirname(sourceFilePath),
          variantFilename
        );

        // Créer la variante
        await sharp(sourceFilePath)
          .resize({
            width,
            height,
            fit,
            withoutEnlargement: true,
          })
          .toFile(variantPath);

        // Ajouter l'URL de la variante au résultat
        const relativePath = path.dirname(imageUrl);
        result[name] = `${relativePath}/${variantFilename}`;
      }

      return result;
    } catch (error) {
      console.error("Erreur lors de la création des variantes:", error);
      return result;
    }
  },
};
