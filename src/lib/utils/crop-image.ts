import type { Area } from "react-easy-crop";

/**
 * Produit un File JPEG carré à partir d'une image source et d'une zone de crop.
 */
export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: Area,
  fileName = "avatar.jpg",
  mimeType = "image/jpeg",
  quality = 0.92
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  // Sortie standard avatar (assez nette pour medium/thumbnail serveur)
  const outputSize = 512;
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Impossible de créer le contexte canvas");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Échec du recadrage"))),
      mimeType,
      quality
    );
  });

  const baseName = fileName.replace(/\.[^/.]+$/, "") || "avatar";
  const ext = mimeType === "image/png" ? "png" : "jpg";

  return new File([blob], `${baseName}.${ext}`, { type: mimeType });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () =>
      reject(new Error("Impossible de charger l'image"))
    );
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}
