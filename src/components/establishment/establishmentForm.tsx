"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  establishmentSchema,
  establishmentUpdateSchema,
  EstablishmentFormData,
} from "@/schemas/establishmentSchema";
import Input from "@/components/ui/inputs/Input";
import { SelectInput } from "@/components/ui/inputs/Input";
import { Button } from "@/components/ui/button";
import { Establishment, User } from "@prisma/client";
import { useEstablishmentMutation } from "@/hooks/query/useEstablishment";
import Modal, { ModalContent } from "@/components/ui/modal";
import { FileUpload } from "../ui/inputs/upload-file";
import Image from "next/image";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Resolver } from "react-hook-form";

// Extension du type Establishment pour inclure logoFileId
interface EstablishmentWithAdmin extends Omit<Establishment, "logoFileId"> {
  logoFileId?: string | null;
  admin: User;
}

interface EstablishmentFormProps {
  establishment?: EstablishmentWithAdmin;
  admins: User[];
  isEditing?: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function EstablishmentForm({
  establishment,
  admins,
  isEditing = false,
  isOpen,
  setIsOpen,
}: EstablishmentFormProps) {
  // État local pour la gestion des images
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Gérer le téléchargement d'images
  const { uploadImage, isLoading: isUploading } = useImageUpload({
    entityType: "establishment",
    storagePath: "establishments",
    fileId: establishment?.logoFileId || undefined,
    onSuccess: (data) => {
      setValue("logoUrl", data.url);
      setValue("logoFileId", data.fileId || "");
    },
  });

  // Nettoyer la prévisualisation
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Utilisation du hook personnalisé pour la mutation
  const { mutate, isPending: isLoading } = useEstablishmentMutation(
    establishment?.id
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EstablishmentFormData>({
    resolver: (isEditing
      ? yupResolver(establishmentUpdateSchema)
      : yupResolver(establishmentSchema)) as Resolver<EstablishmentFormData>,
    defaultValues: establishment || {},
  });

  // Gérer le changement de fichier logo
  const handleFileChange = (file: File | null) => {
    // Si file est null, effacer la prévisualisation
    if (!file) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);
      setSelectedFile(null);
      return;
    }

    // Nettoyer l'ancienne prévisualisation
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    // Stocker le fichier pour l'upload ultérieur
    setSelectedFile(file);

    // Créer une prévisualisation
    const newPreview = URL.createObjectURL(file);
    setPreview(newPreview);

    console.log("Image préparée:", file.name);
  };

  const onSubmit = async (data: EstablishmentFormData) => {
    try {
      // Si une image a été sélectionnée, l'uploader maintenant
      if (selectedFile) {
        await uploadImage(selectedFile);
      }
      // Soumettre les données du formulaire
      mutate(data as Record<string, unknown>, {
        onSuccess: () => {
          if (!isEditing) {
            reset();
            setPreview(null);
            setSelectedFile(null);
          }
          setIsOpen(false);
        },
      });
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    }
  };

  // Gérer la fermeture du modal
  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isEditing ? "Modifier l'établissement" : "Configurer l'établissement"
      }
      size="xl"
    >
      <ModalContent className="w-full max-w-3xl mx-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom de l'établissement"
              type="text"
              {...register("name")}
              error={errors.name}
            />

            <SelectInput
              label="Directeur | Directrice"
              error={errors.adminId}
              options={admins.map((admin) => ({
                id: admin.id,
                name: admin.name || admin.email,
              }))}
              {...register("adminId")}
            />

            <Input
              label="Adresse"
              type="text"
              {...register("address")}
              error={errors.address}
            />

            <div className="flex gap-2">
              <Input
                label="Code postal"
                type="text"
                className="flex-1"
                {...register("postalCode")}
                error={errors.postalCode}
              />

              <Input
                label="Ville"
                type="text"
                className="flex-2"
                {...register("city")}
                error={errors.city}
              />
            </div>

            <Input
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email}
            />

            <Input
              label="Téléphone"
              type="tel"
              {...register("phone")}
              error={errors.phone}
            />

            <Input
              label="Site web"
              type="url"
              {...register("website")}
              error={errors.website}
            />

            {/* Champs cachés pour stocker les valeurs retournées par l'API */}
            <input type="hidden" {...register("logoUrl")} />
            <input type="hidden" {...register("logoFileId")} />
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <h4 className="text-center">
              {preview ? "Modifier le logo" : "Télécharger votre logo"}
            </h4>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              {preview && (
                <div className="relative">
                  <Image
                    src={preview}
                    alt="Logo de l'établissement"
                    width={150}
                    height={150}
                    className="object-contain rounded-md border shadow-sm"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-gray-200/50 flex items-center justify-center">
                      <div className="animate-pulse text-primary text-sm">
                        Téléchargement...
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2 w-full max-w-sm">
                <FileUpload
                  onChange={handleFileChange}
                  accept="image/*"
                  name="logo"
                  multiple={false}
                  disabled={isUploading}
                  label="Choisir une image"
                />
                {isUploading && (
                  <p className="text-xs text-gray-500 text-center">
                    Téléchargement en cours... Veuillez patienter.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>

            <Button
              type="submit"
              variant="solid"
              color="success"
              disabled={isLoading || isUploading}
            >
              {isLoading || isUploading
                ? isEditing
                  ? "Mise à jour..."
                  : "Enregistrement..."
                : isEditing
                ? "Mettre à jour"
                : "Enregistrer"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
