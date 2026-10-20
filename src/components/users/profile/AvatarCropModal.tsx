"use client";

import React, { useCallback, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { ImagePlus, ZoomIn } from "lucide-react";
import Modal, { ModalContent, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { getCroppedImageFile } from "@/lib/utils/crop-image";
import { cn } from "@/lib/utils";

type AvatarCropModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void | Promise<void>;
  isSaving?: boolean;
};

export default function AvatarCropModal({
  isOpen,
  onClose,
  onConfirm,
  isSaving = false,
}: AvatarCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("avatar.jpg");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearImage = useCallback(() => {
    setImageSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setSourceName("avatar.jpg");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      clearImage();
      setIsProcessing(false);
    }
  }, [isOpen, clearImage]);

  const handleClose = () => {
    if (isSaving || isProcessing) return;
    onClose();
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileSelect = (file: File | null) => {
    setError(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image");
      return;
    }

    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setSourceName(file.name || "avatar.jpg");
    setImageSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsProcessing(true);
    setError(null);
    try {
      const file = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        sourceName
      );
      await onConfirm(file);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Impossible de recadrer l'image");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Photo de profil"
      description="Choisissez une image puis ajustez le cadrage"
      size="md"
    >
      <ModalContent className="gap-4">
        {!imageSrc ? (
          <label
            className={cn(
              "flex flex-col items-center justify-center gap-3",
              "min-h-[260px] rounded-xl border-2 border-dashed border-primary/30",
              "bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors",
              "px-4 text-center"
            )}
          >
            <ImagePlus className="h-10 w-10 text-primary/70" />
            <div>
              <p className="font-medium">Choisir une photo</p>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG ou WebP
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleFileSelect(e.target.files?.[0] ?? null)
              }
            />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="relative h-[280px] w-full overflow-hidden rounded-xl bg-black/90">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="flex items-center gap-3 px-1">
              <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-primary"
                aria-label="Zoom"
              />
            </div>

            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={clearImage}
            >
              Choisir une autre image
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </ModalContent>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isSaving || isProcessing}
        >
          Annuler
        </Button>
        <Button
          type="button"
          variant="solid"
          color="success"
          onClick={handleConfirm}
          disabled={!imageSrc || isSaving || isProcessing}
        >
          {isSaving || isProcessing ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
