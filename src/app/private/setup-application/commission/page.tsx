"use client";

import { useState } from "react";
import { useCommissions } from "@/hooks/query/useCommission";
import { Commission } from "@prisma/client";
import CommissionForm from "@/components/commission/CommissionForm";
import CommissionList from "@/components/commission/CommissionList";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { CommissionsDetailsTabs } from "@/components/commission/CommissionDetails";

export default function CommissionPage() {
  const { data: commissionsData, isLoading } = useCommissions();
  const commissions = commissionsData?.data || [];

  // États pour gérer les modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

  // Fonctions de gestion des événements
  const handleCreateClick = () => {
    setSelectedCommission(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (commission: Commission) => {
    setSelectedCommission(commission);
    setIsFormOpen(true);
  };

  const handleAddMember = (commission: Commission) => {
    setSelectedCommission(commission);
  };

  const handleFormSuccess = () => {
    setSelectedCommission(null);
    setIsFormOpen(false);
  };



  return (
    <div className="container mx-auto py-8 space-y-16">
      <div className="flex justify-between items-center">
        <h1 className="">Gestion des commissions</h1>

        <Button
          onClick={handleCreateClick}
          color="secondary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Créer une commission
        </Button>
      </div>

      <div className="space-y-12">
        <CommissionList
          commissions={commissions}
          onAddMember={handleAddMember}
          onEdit={handleEditClick}
          onCreate={handleCreateClick}
          isLoading={isLoading}
        />

        <div className="space-y-4">
         <h2> Détails des commissions</h2>

         <CommissionsDetailsTabs commissions={commissions} isLoading={isLoading} />
      
        </div>

        

   

      </div>
      {isFormOpen && (
        <CommissionForm
          commission={selectedCommission || undefined}
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

