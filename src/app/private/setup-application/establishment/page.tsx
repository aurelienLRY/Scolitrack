"use client";

import React, { useState } from "react";
import { User, EducationLevel } from "@prisma/client";
import {
  EstablishmentCard,
  SkeletonEstablishmentCard,
} from "@/components/establishment";
import EstablishmentForm from "@/components/establishment/establishmentForm";
import EducationLevelCard from "@/components/establishment/educationLevelCard";
import { Button } from "@/components/ui/button";
import { useEstablishment, useAdmins } from "@/hooks";
import {
  useEducationLevels,
  useCreateEducationLevel,
  useDeleteEducationLevel,
  useUpdateEducationLevel,
} from "@/hooks/query/useEducationLevel";
import { Edit, Plus } from "lucide-react";
import SkeletonEducationLevelManager from "@/components/establishment/skeleton-educationLevel";
import { toast } from "sonner";
import EducationLevelForm from "@/components/establishment/educationLevelForm";
import { EducationLevelFormData } from "@/schemas/educationLevelSchema";

export default function EstablishmentPage() {
  const [showEstablishmentForm, setShowEstablishmentForm] = useState(false);
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState<EducationLevel | null>(null);

  // Utilisation des hooks personnalisés pour charger les données
  const { data: establishment, isLoading } = useEstablishment();

  // Extraction des données
  const allAdmins = useAdmins().data?.data as unknown as User[];
  const establishmentData = establishment?.data;

  // Récupération des niveaux d'éducation
  const { data: educationLevelsData, isLoading: isLoadingLevels } =
    useEducationLevels(establishmentData?.id || "");

  const educationLevels = educationLevelsData?.data || [];

  // Hooks de mutation pour les niveaux d'éducation
  const { mutate: createLevel, isPending: isCreatingLevel } =
    useCreateEducationLevel();
  const { mutate: deleteLevel } = useDeleteEducationLevel();
  const { mutate: updateLevel, isPending: isUpdatingLevel } =
    useUpdateEducationLevel(editingLevel?.id || "");

  // Filtrer les administrateurs pour éviter les doublons
  const adminData = establishmentData?.admin;
  const admins = adminData
    ? [
        adminData,
        ...(allAdmins || []).filter((admin) => admin.id !== adminData.id),
      ]
    : [...(allAdmins || [])];

  const handleEditEstablishment = () => {
    setShowEstablishmentForm(true);
  };

  const handleNewEstablishment = () => {
    setShowEstablishmentForm(true);
  };

  const handleEstablishmentSaved = () => {
    setShowEstablishmentForm(false);
  };

  const handleAddLevel = () => {
    setEditingLevel(null);
    setShowLevelForm(true);
  };

  const handleEditLevel = (level: EducationLevel) => {
    setEditingLevel(level);
    setShowLevelForm(true);
  };

  const handleDeleteLevel = (level: EducationLevel) => {
    toast.warning(`Supprimer le niveau "${level.name}" ?`, {
      description: "Cette action ne peut pas être annulée.",
      action: {
        label: "Supprimer",
        onClick: () => {
          deleteLevel(level.id);
        },
      },
      cancel: {
        label: "Annuler",
        onClick: () => {},
      },
    });
  };

  const handleSubmitLevel = (data: EducationLevelFormData) => {
    if (editingLevel) {
      updateLevel(data, {
        onSuccess: () => {
          setShowLevelForm(false);
        },
      });
    } else {
      createLevel(data, {
        onSuccess: () => {
          setShowLevelForm(false);
        },
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 lg:gap-16 items-center min-h-[calc(100vh-200px)]">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 justify-between items-center w-full">
        <h1 className="text-3xl font-bold text-center lg:text-left">
          Configuration de l&apos;établissement
        </h1>

        {establishmentData && (
          <div className="flex flex-col lg:flex-row gap-4">
            <Button
              onClick={handleEditEstablishment}
              variant="outline"
              color="warning"
            >
              <Edit className="mr-1" /> Modifier l&apos;établissement
            </Button>

            <Button
              onClick={handleAddLevel}
              variant="outline"
              color="secondary"
            >
              <Plus className="mr-1" /> Ajouter un niveau
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center items-center max-w-[1300px] mx-auto gap-4 ">
        {isLoading ? (
          <SkeletonEstablishmentCard />
        ) : (
          <EstablishmentCard
            // @ts-expect-error - Type is compatible but TypeScript has trouble with the import paths
            establishment={establishmentData}
            handleNewEstablishment={handleNewEstablishment}
          />
        )}

        {isLoadingLevels || isLoading ? (
          <SkeletonEducationLevelManager />
        ) : (
          <EducationLevelCard
            educationLevels={educationLevels}
            onComplete={handleAddLevel}
            onEdit={handleEditLevel}
            onDelete={handleDeleteLevel}
          />
        )}
      </div>

      {showEstablishmentForm && (
        <EstablishmentForm
          isOpen={showEstablishmentForm}
          setIsOpen={setShowEstablishmentForm}
          // @ts-expect-error - Type is compatible but TypeScript has trouble with the import paths
          establishment={establishmentData}
          admins={admins}
          isEditing={!!establishmentData}
          onSuccess={handleEstablishmentSaved}
        />
      )}

      {showLevelForm && (
        <EducationLevelForm
          isOpen={showLevelForm}
          setIsOpen={setShowLevelForm}
          defaultValues={
            editingLevel
              ? {
                  name: editingLevel.name,
                  code: editingLevel.code,
                  establishmentId: establishmentData?.id || "",
                }
              : {
                  name: "",
                  code: "",
                  establishmentId: establishmentData?.id || "",
                }
          }
          onSubmit={handleSubmitLevel}
          isSubmitting={isCreatingLevel || isUpdatingLevel}
          isEditing={!!editingLevel}
        />
      )}
    </div>
  );
}
