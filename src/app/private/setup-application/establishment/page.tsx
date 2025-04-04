"use client";
/* Libs */
import React, { useState } from "react";
import { User } from "@prisma/client";
/* Components */
import {
  EstablishmentCard,
  SkeletonEstablishmentCard,
} from "@/components/establishment";
import EstablishmentForm from "@/components/establishment/establishmentForm";
import { Button } from "@/components/ui/button";
/* Hooks */
import { useEstablishment, useAdmins } from "@/hooks";
/* Icons */
import { Edit } from "lucide-react";

export default function EstablishmentPage() {
  const [showForm, setShowForm] = useState(false);

  // Utilisation des hooks personnalisés pour charger les données
  const { data: establishment, isLoading } = useEstablishment();

  // Extraction des données
  const allAdmins = useAdmins().data?.data as unknown as User[];

  // Filtrer les administrateurs pour éviter les doublons
  const adminData = establishment?.data?.admin;
  const admins = adminData
    ? [
        adminData,
        ...(allAdmins || []).filter((admin) => admin.id !== adminData.id),
      ]
    : [...(allAdmins || [])];

  const handleEdit = () => {
    setShowForm(true);
  };

  const handleNewEstablishment = () => {
    setShowForm(true);
  };

  return (
    <div className="w-full flex flex-col gap-8 lg:gap-16 items-center min-h-[calc(100vh-200px)]">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 justify-between items-center w-full">
        <h1 className="text-3xl font-bold text-center lg:text-left">
          Configuration de l&apos;établissement
        </h1>

        {establishment && (
          <Button onClick={handleEdit} variant="outline" color="warning">
            <Edit className="mr-1" /> Modifier l&apos;établissement
          </Button>
        )}
      </div>
      <div className="flex justify-center items-center">
        {isLoading ? (
          <SkeletonEstablishmentCard />
        ) : (
          <EstablishmentCard
            // @ts-expect-error - Type is compatible but TypeScript has trouble with the import paths
            establishment={establishment?.data}
            handleNewEstablishment={handleNewEstablishment}
          />
        )}
      </div>
      {showForm && (
        <EstablishmentForm
          isOpen={showForm}
          setIsOpen={setShowForm}
          // @ts-expect-error - Type is compatible but TypeScript has trouble with the import paths
          establishment={establishment?.data}
          admins={admins}
          isEditing={!!establishment}
        />
      )}
    </div>
  );
}
