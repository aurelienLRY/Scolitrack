import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  EducationLevelFormData,
  educationLevelSchema,
} from "@/schemas/educationLevelSchema";
import Input from "@/components/ui/inputs/Input";
import { Button } from "@/components/ui";
import Modal, { ModalContent } from "@/components/ui/modal";

interface EducationLevelFormProps {
  defaultValues?: EducationLevelFormData;
  onSubmit: (data: EducationLevelFormData) => void;
  isSubmitting: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isEditing?: boolean;
}

export default function EducationLevelForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  isOpen,
  setIsOpen,
  isEditing = false,
}: EducationLevelFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EducationLevelFormData>({
    resolver: yupResolver(educationLevelSchema),
    defaultValues,
  });

  const handleFormSubmit = (data: EducationLevelFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isEditing
          ? "Modifier un niveau d'enseignement"
          : "Ajouter un niveau d'enseignement"
      }
    >
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <input type="hidden" {...register("establishmentId")} />

          <Input
            label="Nom du niveau"
            placeholder="Ex: Petite section"
            {...register("name")}
            error={errors.name}
          />

          <Input
            label="Code"
            placeholder="Ex: PS"
            {...register("code")}
            error={errors.code}
          />

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="link"
              onClick={handleClose}
              className="text-destructive/50"
            >
              Annuler
            </Button>

            <Button
              type="submit"
              variant="solid"
              color="accent"
              disabled={isSubmitting}
            >
              {isSubmitting
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
