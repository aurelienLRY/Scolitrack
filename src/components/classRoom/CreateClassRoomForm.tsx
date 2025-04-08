"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  classRoomSchema,
  classRoomUpdateSchema,
  TClassRoomFormData,
} from "@/schemas/ClassRoomSchema";

import { ClassRoomComplete } from "@/types/classroom.type";
import Input from "@/components/ui/inputs/Input";
import { Button } from "@/components/ui/button";
import {
  useCreateClassRoom,
  useUpdateClassRoom,
} from "@/hooks/query/useClassRoom";
import Modal from "@/components/ui/modal";
import { FileUpload } from "../ui/inputs/upload-file";
import Image from "next/image";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Resolver } from "react-hook-form";
import { useEducationLevels } from "@/hooks/query/useEducationLevel";
import { toast } from "sonner";

import { SketchPicker } from "react-color";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/inputs/checkbox";

interface ClassRoomFormProps {
  classRoom?: ClassRoomComplete;
  establishmentId: string;
  isEditing?: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function CreateClassRoomForm({
  classRoom,
  establishmentId,
  isEditing = false,
  isOpen,
  setIsOpen,
}: ClassRoomFormProps) {
  const { data: educationLevelsData } = useEducationLevels(establishmentId);
  const educationLevels = educationLevelsData?.data || [];

  // État local pour la gestion des images et couleurs
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [colorCode, setColorCode] = useState<string>(
    classRoom?.colorCode || "#4A90E2"
  );
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Gérer le téléchargement d'images
  const { uploadImage, isLoading: isUploading } = useImageUpload({
    entityType: "classroom",
    storagePath: "classrooms",
    fileId: classRoom?.logoFileId || undefined,
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

  // Initialiser la couleur à partir des props au chargement
  useEffect(() => {
    if (classRoom?.colorCode) {
      setColorCode(classRoom.colorCode);
    }
  }, [classRoom]);

  // Utilisation des hooks personnalisés pour la mutation
  const { mutate: createClassRoom, isPending: isCreating } =
    useCreateClassRoom();
  const { mutate: updateClassRoom, isPending: isUpdating } = useUpdateClassRoom(
    classRoom?.id || ""
  );

  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<TClassRoomFormData>({
    resolver: (isEditing
      ? yupResolver(classRoomUpdateSchema)
      : yupResolver(classRoomSchema)) as Resolver<TClassRoomFormData>,
    defaultValues:
      isEditing && classRoom
        ? {
            ...classRoom,
            educationLevelIds:
              classRoom.educationLevels?.map(
                (level) => level.educationLevel.id
              ) || [],
          }
        : {
            establishmentId,
            colorCode: "#4A90E2",
            educationLevelIds: [],
          },
  });

  // Observer les changements de la valeur colorCode dans le formulaire
  const watchedColorCode = watch("colorCode");

  // Mise à jour de l'état colorCode lorsque watchedColorCode change
  useEffect(() => {
    if (watchedColorCode && watchedColorCode !== colorCode) {
      setColorCode(watchedColorCode);
    }
  }, [watchedColorCode, colorCode]);

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
  };

  // Gérer le changement de couleur
  const handleColorChange = (color: { hex: string }) => {
    const newColor = color.hex;
    setColorCode(newColor);
    setValue("colorCode", newColor);
  };

  // Ajouter un useEffect pour mettre à jour les niveaux d'éducation lorsque educationLevels change
  useEffect(() => {
    if (
      isEditing &&
      classRoom &&
      classRoom.educationLevels &&
      classRoom.educationLevels.length > 0
    ) {
      const levelIds = classRoom.educationLevels.map(
        (level) => level.educationLevel.id
      );
      setValue("educationLevelIds", levelIds);
    }
  }, [isEditing, classRoom, setValue]);

  const onSubmit = async (data: TClassRoomFormData) => {
    try {
      // Si une image a été sélectionnée, l'uploader maintenant
      if (selectedFile) {
        await uploadImage(selectedFile);
      }

      const submitData = {
        ...data,
        educationLevelIds: data.educationLevelIds || [],
      };

      if (isEditing && classRoom) {
        updateClassRoom(submitData, {
          onSuccess: () => {
            handleClose();
          },
        });
      } else {
        createClassRoom(submitData, {
          onSuccess: () => {
            handleClose();
          },
        });
      }
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast.error("Une erreur est survenue");
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
      title={isEditing ? "Modifier la classe" : "Ajouter une classe"}
      size="full"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom de la classe"
            type="text"
            {...register("name")}
            error={errors.name}
            placeholder="ex: Los pitchouns"
          />

          <Input
            label="Capacité"
            type="number"
            {...register("capacity")}
            error={errors.capacity}
            placeholder="ex: 25"
          />

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Couleur de la classe</label>
            <div className="flex items-center gap-2">
              <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 p-1 flex items-center justify-between"
                  >
                    <span>Sélectionner une couleur</span>
                    <div
                      className="w-6 h-6 rounded-md ml-2"
                      style={{ backgroundColor: colorCode }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none">
                  <SketchPicker
                    color={colorCode}
                    onChange={handleColorChange}
                    disableAlpha
                  />
                </PopoverContent>
              </Popover>
            </div>
            <input type="hidden" {...register("colorCode")} value={colorCode} />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">
              Niveaux d&apos;enseignement
            </label>
            {educationLevels.length === 0 ? (
              <div className="p-4 border rounded-md bg-background-component/30 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucun niveau d&apos;enseignement disponible. Veuillez
                  d&apos;abord configurer les niveaux.
                </p>
              </div>
            ) : (
              <Controller
                name="educationLevelIds"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 border rounded-md bg-background-component/30">
                    {educationLevels.map((level) => (
                      <div
                        key={level.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`level-${level.id}`}
                          checked={field.value?.includes(level.id)}
                          onCheckedChange={(checked) => {
                            const value = level.id;
                            const newValues = checked
                              ? [...(field.value || []), value]
                              : (field.value || []).filter(
                                  (id) => id !== value
                                );
                            field.onChange(newValues);
                          }}
                          variant="primary"
                          styleVariant="solid"
                        />
                        <label
                          htmlFor={`level-${level.id}`}
                          className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                        >
                          <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                            {level.code}
                          </span>
                          {level.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
            )}
            {errors.educationLevelIds && (
              <p className="mt-1 text-sm text-destructive">
                {errors.educationLevelIds.message}
              </p>
            )}
          </div>

          {/* Champs cachés pour stocker les valeurs retournées par l'API */}
          <input type="hidden" {...register("logoUrl")} />
          <input type="hidden" {...register("logoFileId")} />
          <input
            type="hidden"
            {...register("establishmentId")}
            value={establishmentId}
          />
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <h4 className="text-center">
            {preview || classRoom?.logoUrl
              ? "Modifier le logo"
              : "Télécharger un logo"}
          </h4>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            {(preview || classRoom?.logoUrl) && (
              <div className="relative">
                <Image
                  src={
                    preview ||
                    classRoom?.logoUrl ||
                    "/img/classroom-default.png"
                  }
                  alt="Logo de la classe"
                  width={100}
                  height={100}
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
                : "Création..."
              : isEditing
              ? "Mettre à jour"
              : "Créer la classe"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
