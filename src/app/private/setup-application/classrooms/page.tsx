"use client";

import React, { useState } from "react";
import ClassRoomList from "@/components/classRoom/ClassRoomList";
import { Button } from "@/components/ui/button";
import { useEstablishment } from "@/hooks";
import CreateClassRoomForm from "@/components/classRoom/CreateClassRoomForm";
import { Plus } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

export default function ClassesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Utiliser le hook pour obtenir l'ID de l'établissement
  const { data: establishmentData, isLoading } = useEstablishment();
  const establishmentId = establishmentData?.data?.id;

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  if (isLoading || !establishmentId) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-8 lg:gap-12 p-6 max-w-[1300px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 justify-between items-center w-full">
        <h1 className="text-3xl font-bold text-center lg:text-left">
          Gestion des classes
        </h1>

        <Button onClick={handleCreateClick} variant="solid" color="secondary">
          <Plus className="mr-2" /> Ajouter une classe
        </Button>
      </div>

      <div className="w-full">
        <ClassRoomList establishmentId={establishmentId} />
      </div>

      {showCreateForm && (
        <CreateClassRoomForm
          establishmentId={establishmentId}
          isOpen={showCreateForm}
          setIsOpen={setShowCreateForm}
        />
      )}
    </div>
  );
}
