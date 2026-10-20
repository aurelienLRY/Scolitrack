/** Préfixe d'URL publique servi par l'API storage */
export const IMAGE_API_PREFIX = "/api/storage/images";

const DEFAULT_AVATAR = "/icons/my-account.png";

/**
 * Ajoute un suffixe de variante avant l'extension (_thumbnail, _medium, …).
 * Compatible URLs API (/api/storage/images/...) et legacy (/img/uploads/...).
 */
export function withImageVariant(
  url: string | null | undefined,
  variant?: "thumbnail" | "medium" | string
): string | null {
  if (!url) return null;
  if (!variant) return url;
  return url.replace(/(\.[^.]+)$/, `_${variant}$1`);
}

/**
 * Construit l'URL API à partir d'un chemin relatif sous storage/images.
 */
export function buildImageApiUrl(relativeStoragePath: string): string {
  const cleaned = relativeStoragePath
    .replace(/^[/\\]+/, "")
    .replace(/\\/g, "/");
  return `${IMAGE_API_PREFIX}/${cleaned}`;
}

/**
 * Extrait le fileId (img_…) d'une URL d'image pour permettre le remplacement.
 */
export function extractImageFileId(
  url: string | null | undefined
): string | undefined {
  if (!url) return undefined;
  const match = url.match(/(img_[a-f0-9-]+)/i);
  return match?.[1];
}

/**
 * URL d'avatar utilisateur avec variante optionnelle et fallback.
 */
export function getUserAvatarSrc(
  image: string | null | undefined,
  variant?: "thumbnail" | "medium"
): string {
  return (
    withImageVariant(image, variant) || image || DEFAULT_AVATAR
  );
}
