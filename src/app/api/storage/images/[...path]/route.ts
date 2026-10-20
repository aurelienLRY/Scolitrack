import { NextRequest } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import {
  IMAGE_STORAGE_ROOT,
  imageService,
} from "@/lib/services/image.service";
import { errorResponse, handleApiError, HttpStatus } from "@/lib/services/api.service";

type RouteContext = { params: Promise<{ path: string[] }> };

const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

/**
 * GET — sert une image stockée sous storage/images/
 * Exemple : /api/storage/images/classrooms/img_xxx.webp
 *
 * Route volontairement accessible sans privilège (les logos classes
 * étaient déjà publics via /public). L'optimiseur Next/Image peut
 * ainsi fetcher sans cookie de session.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const segments = (await context.params).path;

    if (!segments?.length) {
      return errorResponse({
        feedback: "Chemin d'image manquant",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Empêcher path traversal via segments
    if (segments.some((s) => s === ".." || s.includes("\0"))) {
      return errorResponse({
        feedback: "Chemin invalide",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const relativePath = segments.join("/");
    const absolute = path.resolve(IMAGE_STORAGE_ROOT, relativePath);

    if (!absolute.startsWith(path.resolve(IMAGE_STORAGE_ROOT))) {
      return errorResponse({
        feedback: "Chemin invalide",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    let buffer: Buffer;
    try {
      buffer = await imageService.readImageBuffer(relativePath);
    } catch {
      return errorResponse({
        feedback: "Image introuvable",
        status: HttpStatus.NOT_FOUND,
      });
    }

    const ext = path.extname(absolute).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || "application/octet-stream";
    const stats = await fs.stat(absolute);

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stats.size),
        // Cache navigateur raisonnable ; invalidation via nouveau fileId à chaque upload
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la lecture de l'image");
  }
}
