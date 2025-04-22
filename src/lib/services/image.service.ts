// src/lib/services/image.service.ts

import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

// Polyfill pour File en environnement serveur (Node.js)
// Cette classe résout l'erreur "File is not defined" en production
class NodeFile {
  name: string;
  type: string;
  data: Buffer;

  constructor(data: Buffer, name: string, options?: { type?: string }) {
    this.data = data;
    this.name = name;
    this.type = options?.type || "application/octet-stream";
  }

  async arrayBuffer() {
    return this.data.buffer;
  }
}

// Interface pour les objets de type fichier
export interface FileWithType {
  name: string;
  type: string;
  arrayBuffer?: () => Promise<ArrayBuffer>;
  [key: string]: unknown;
}

// Type unifié pour les fichiers qui fonctionne à la fois côté client et serveur
type UniversalFile =
  | File
  | NodeFile
  | Buffer
  | FormDataEntryValue
  | FileWithType;

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
    file: UniversalFile,
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

    try {
      // Créer tous les dossiers nécessaires
      // Gérer les chemins avec \ ou / sur Windows
      const normalizedDir = directory.replace(/\\/g, "/");
      const fullDirPath = path.join(process.cwd(), normalizedDir);

      // Créer tous les dossiers sur le chemin
      await fs.mkdir(fullDirPath, { recursive: true });

      // Vérifier que le dossier a bien été créé
      await fs.access(fullDirPath);

      // Générer un nom de fichier basé sur l'ID du fichier
      const filename = `${fileId}.${format}`;
      const fullPath = path.join(fullDirPath, filename);

      // Convertir le fichier en buffer
      let buffer: Buffer;

      if (Buffer.isBuffer(file)) {
        buffer = file;
      } else if (file instanceof NodeFile) {
        buffer = file.data;
      } else if (typeof File !== "undefined" && file instanceof File) {
        // Pour un objet File (côté navigateur)
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else if (typeof file === "object" && file !== null) {
        // Gestion d'objets FormDataEntryValue ou FileWithType
        if ("arrayBuffer" in file && typeof file.arrayBuffer === "function") {
          const arrayBuffer = await (file as FileWithType).arrayBuffer!();
          buffer = Buffer.from(arrayBuffer);
        } else if ("stream" in file && typeof file.stream === "function") {
          // Pour les objets avec une méthode stream (comme certains FormDataEntryValue)
          const chunks: Buffer[] = [];
          const streamMethod = (
            file as { stream: () => ReadableStream<Uint8Array> }
          ).stream;
          const stream = streamMethod();

          // Utiliser le reader au lieu de for await...of
          const reader = stream.getReader();
          let done = false;

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            if (value) {
              chunks.push(Buffer.from(value));
            }
          }

          buffer = Buffer.concat(chunks);
        } else if (file instanceof Blob) {
          // Pour les objets Blob
          const arrayBuffer = await file.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        } else {
          throw new Error(
            "Format de fichier non pris en charge: impossible d'extraire les données binaires"
          );
        }
      } else if (typeof file === "string") {
        // Si par hasard nous recevons une chaîne (URL ou chemin)
        if (file.startsWith("data:")) {
          // Data URL (base64)
          const base64Data = file.split(",")[1];
          buffer = Buffer.from(base64Data, "base64");
        } else {
          // Considérer comme chemin de fichier local
          buffer = await fs.readFile(file);
        }
      } else {
        throw new Error("Format de fichier non pris en charge");
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
      const relativePath = normalizedDir.replace(/^public\//, "/");
      const url = `${relativePath}/${filename}`;

      // Retourner les informations sur l'image stockée
      return {
        url,
        fileId,
        filePath: fullPath,
      };
    } catch (error) {
      console.error("Erreur lors du stockage de l'image:", error);
      throw error;
    }
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
      // Chercher dans tous les répertoires où des images peuvent être stockées
      const directories = [
        path.join(process.cwd(), "public/img/uploads"),
        path.join(process.cwd(), "public/uploads"),
      ];

      let deleted = false;

      // Parcourir tous les répertoires possibles
      for (const dir of directories) {
        try {
          // Vérifier si le répertoire existe avant de le scanner
          await fs.access(dir);
          const dirDeleted = await this.findAndDeleteFilesByPrefix(dir, fileId);
          deleted = deleted || dirDeleted;
        } catch (err) {
          // Ignorer les erreurs si le répertoire n'existe pas
          console.log(
            `Le répertoire ${dir} n'existe pas, passage au suivant. Erreur: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      }

      return deleted;
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
