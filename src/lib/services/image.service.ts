// src/lib/services/image.service.ts

import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import {
  IMAGE_API_PREFIX,
  buildImageApiUrl,
} from "@/lib/utils/image-url";

/** Racine des images uploadées (hors public/ pour éviter les soucis Next.js) */
export const IMAGE_STORAGE_ROOT = path.join(process.cwd(), "storage", "images");

// Polyfill pour File en environnement serveur (Node.js)
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

export interface FileWithType {
  name: string;
  type: string;
  arrayBuffer?: () => Promise<ArrayBuffer>;
  [key: string]: unknown;
}

type UniversalFile =
  | File
  | NodeFile
  | Buffer
  | FormDataEntryValue
  | FileWithType;

export interface ImageStorageOptions {
  /** Sous-dossier relatif à storage/images (ex: "classrooms") */
  directory?: string;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill";
  fileId?: string;
}

interface ImageStorageResult {
  url: string;
  fileId: string;
  filePath: string;
  storagePath: string;
}

const FILE_ID_PREFIX = "img_";

/**
 * Résout un chemin relatif storage en chemin absolu, avec garde anti path-traversal.
 */
function absoluteStoragePath(relativePath: string): string {
  const normalized = relativePath.replace(/^[/\\]+/, "").replace(/\\/g, "/");
  const full = path.join(IMAGE_STORAGE_ROOT, normalized);
  const resolved = path.resolve(full);
  if (!resolved.startsWith(path.resolve(IMAGE_STORAGE_ROOT))) {
    throw new Error("Chemin de fichier invalide");
  }
  return resolved;
}

/**
 * Convertit une URL API ou legacy en chemin fichier absolu.
 */
function resolveFilePathFromUrl(url: string): string {
  if (url.startsWith(IMAGE_API_PREFIX + "/")) {
    const relative = url.slice(IMAGE_API_PREFIX.length + 1);
    return absoluteStoragePath(relative);
  }

  // Legacy : /img/uploads/... → public/img/uploads/...
  if (url.startsWith("/img/uploads/") || url.startsWith("img/uploads/")) {
    const cleaned = url.replace(/^\//, "");
    return path.join(process.cwd(), "public", cleaned);
  }

  // Ancien format public/uploads
  if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    const cleaned = url.replace(/^\//, "");
    return path.join(process.cwd(), "public", cleaned);
  }

  return path.join(process.cwd(), "public", url.replace(/^\//, ""));
}

export const imageService = {
  storageRoot: IMAGE_STORAGE_ROOT,

  /**
   * Stocke une image téléchargée et renvoie son URL API et son ID
   */
  async storeImage(
    file: UniversalFile,
    options: ImageStorageOptions = {}
  ): Promise<ImageStorageResult> {
    const {
      directory = "general",
      quality = 80,
      format = "webp",
      width,
      height,
      fit = "cover",
      fileId = `${FILE_ID_PREFIX}${uuidv4()}`,
    } = options;

    try {
      // Nettoyer le sous-dossier (pas de "public/", pas de traversal)
      const relativeDir = directory
        .replace(/\\/g, "/")
        .replace(/^public\//, "")
        .replace(/^img\/uploads\//, "")
        .replace(/^storage\/images\//, "")
        .replace(/^[/\\]+/, "");

      const fullDirPath = absoluteStoragePath(relativeDir);
      await fs.mkdir(fullDirPath, { recursive: true });
      await fs.access(fullDirPath);

      const filename = `${fileId}.${format}`;
      const relativePath = path.join(relativeDir, filename).replace(/\\/g, "/");
      const fullPath = absoluteStoragePath(relativePath);

      let buffer: Buffer;

      if (Buffer.isBuffer(file)) {
        buffer = file;
      } else if (file instanceof NodeFile) {
        buffer = file.data;
      } else if (typeof File !== "undefined" && file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else if (typeof file === "object" && file !== null) {
        if ("arrayBuffer" in file && typeof file.arrayBuffer === "function") {
          const arrayBuffer = await (file as FileWithType).arrayBuffer!();
          buffer = Buffer.from(arrayBuffer);
        } else if ("stream" in file && typeof file.stream === "function") {
          const chunks: Buffer[] = [];
          const streamMethod = (
            file as { stream: () => ReadableStream<Uint8Array> }
          ).stream;
          const stream = streamMethod();
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
          const arrayBuffer = await file.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        } else {
          throw new Error(
            "Format de fichier non pris en charge: impossible d'extraire les données binaires"
          );
        }
      } else if (typeof file === "string") {
        if (file.startsWith("data:")) {
          const base64Data = file.split(",")[1];
          buffer = Buffer.from(base64Data, "base64");
        } else {
          buffer = await fs.readFile(file);
        }
      } else {
        throw new Error("Format de fichier non pris en charge");
      }

      let sharpInstance = sharp(buffer);

      if (width || height) {
        sharpInstance = sharpInstance.resize({
          width,
          height,
          fit,
          withoutEnlargement: true,
        });
      }

      if (format === "webp") {
        sharpInstance = sharpInstance.webp({ quality });
      } else if (format === "jpeg") {
        sharpInstance = sharpInstance.jpeg({ quality });
      } else if (format === "png") {
        sharpInstance = sharpInstance.png({ quality });
      }

      await sharpInstance.toFile(fullPath);

      return {
        url: buildImageApiUrl(relativePath),
        fileId,
        filePath: fullPath,
        storagePath: relativePath,
      };
    } catch (error) {
      console.error("Erreur lors du stockage de l'image:", error);
      throw error;
    }
  },

  /**
   * Lit le buffer d'une image via son chemin relatif sous storage/images
   */
  async readImageBuffer(relativePath: string): Promise<Buffer> {
    return fs.readFile(absoluteStoragePath(relativePath));
  },

  /**
   * Supprime une image en fonction de son URL (API ou legacy)
   */
  async deleteImage(url: string): Promise<boolean> {
    if (!url) return false;

    try {
      const filePath = resolveFilePathFromUrl(url);
      await fs.unlink(filePath);

      const dir = path.dirname(filePath);
      const filename = path.basename(filePath);
      const baseFilename = path.parse(filename).name;
      const extension = path.parse(filename).ext;

      const files = await fs.readdir(dir);
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
      const directories = [
        IMAGE_STORAGE_ROOT,
        path.join(process.cwd(), "public/img/uploads"),
        path.join(process.cwd(), "public/uploads"),
      ];

      let deleted = false;

      for (const dir of directories) {
        try {
          await fs.access(dir);
          const dirDeleted = await this.findAndDeleteFilesByPrefix(dir, fileId);
          deleted = deleted || dirDeleted;
        } catch {
          // Répertoire inexistant : ignorer
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
          const result = await this.findAndDeleteFilesByPrefix(
            fullPath,
            prefix
          );
          deleted = deleted || result;
        } else if (
          entry.isFile() &&
          path.parse(entry.name).name.startsWith(prefix)
        ) {
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
    const sourceFilePath = resolveFilePathFromUrl(imageUrl);

    try {
      await fs.access(sourceFilePath);

      for (const [name, config] of Object.entries(variants)) {
        const { width, height, fit = "cover" } = config;

        const extension = path.extname(imageUrl);
        const basename = path.basename(imageUrl, extension);
        const variantFilename = `${basename}_${name}${extension}`;
        const variantPath = path.join(
          path.dirname(sourceFilePath),
          variantFilename
        );

        await sharp(sourceFilePath)
          .resize({
            width,
            height,
            fit,
            withoutEnlargement: true,
          })
          .toFile(variantPath);

        const relativePath = path.dirname(imageUrl);
        result[name] = `${relativePath}/${variantFilename}`.replace(
          /\\/g,
          "/"
        );
      }

      return result;
    } catch (error) {
      console.error("Erreur lors de la création des variantes:", error);
      return result;
    }
  },
};
