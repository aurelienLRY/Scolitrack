// src/lib/services/image-client.service.ts

export interface ImageResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

export class ImageClientService {
  static async prepareImage(
    file: File,
    options: ImageResizeOptions = {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format: "webp",
    }
  ): Promise<{ file: File; preview: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculer les dimensions en respectant le ratio
          let width = img.width;
          let height = img.height;

          if (options.maxWidth && width > options.maxWidth) {
            height = (options.maxWidth / width) * height;
            width = options.maxWidth;
          }

          if (options.maxHeight && height > options.maxHeight) {
            width = (options.maxHeight / height) * width;
            height = options.maxHeight;
          }

          // Créer un canvas pour redimensionner l'image
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Impossible de créer le contexte 2D"));
            return;
          }

          // Dessiner l'image redimensionnée
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir en blob avec le format désiré
          const mimeType =
            options.format === "webp"
              ? "image/webp"
              : options.format === "png"
              ? "image/png"
              : "image/jpeg";

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Échec de la conversion en blob"));
                return;
              }

              // Créer un nouveau fichier avec le bon type MIME
              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, `.${options.format}`),
                { type: mimeType }
              );

              // Créer une URL de prévisualisation
              const preview = URL.createObjectURL(blob);

              resolve({ file: optimizedFile, preview });
            },
            mimeType,
            options.quality
          );
        };

        img.onerror = () =>
          reject(new Error("Erreur lors du chargement de l'image"));
        img.src = e.target?.result as string;
      };

      reader.onerror = () =>
        reject(new Error("Erreur lors de la lecture du fichier"));
      reader.readAsDataURL(file);
    });
  }

  static revokePreview(preview: string): void {
    URL.revokeObjectURL(preview);
  }
}
