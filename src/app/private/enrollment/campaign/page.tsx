"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEnrollmentCampaigns, useDeleteEnrollmentCampaign } from "@/hooks";
import { CampaignList } from "@/components/enrollment-campaign";
import { EnrollmentCampaignComplete } from "@/types/enrollment.type";
import { Card, Button } from "@/components/ui";
import { Plus, Info } from "lucide-react";
import { toast } from "sonner";

export default function CampaignPage() {
  const router = useRouter();
  const { data: campaigns, isLoading, error } = useEnrollmentCampaigns();
  const deleteCampaign = useDeleteEnrollmentCampaign();
  const [showInfo, setShowInfo] = useState(true);

  const handleEditCampaign = (campaign: EnrollmentCampaignComplete) => {
    router.push(`/private/enrollment/campaign/${campaign.id}/edit`);
  };

  const handleDeleteCampaign = (campaign: EnrollmentCampaignComplete) => {
    const filesCount = campaign._count?.enrollmentFiles || 0;
    const endPassed = new Date(campaign.endDate) < new Date();

    if (!endPassed) {
      toast.error(
        "Impossible de supprimer une campagne dont la date de fin n'est pas encore passée"
      );
      return;
    }
    if (filesCount > 0) {
      toast.error(
        "Impossible de supprimer une campagne qui contient encore des dossiers. Mettez-les en corbeille et attendez la purge (30 jours), ou récupérez-les."
      );
      return;
    }

    if (
      !confirm(
        `Supprimer définitivement la campagne « ${campaign.name} » ?`
      )
    ) {
      return;
    }

    // Feedback toast géré par useApiMutation
    deleteCampaign.mutate(campaign.id);
  };

  const handleCreateCampaign = () => {
    router.push("/private/enrollment/campaign/create");
  };

  // Gestion des erreurs
  if (error) {
    return (
      <div className="space-y-6 container mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Erreur lors du chargement des campagnes</p>
          <Button onClick={() => router.refresh()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto">
      {/* Header avec bouton de création */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Campagnes d&apos;inscription</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos campagnes d&apos;inscription scolaire
          </p>
        </div>
        <Button 
          onClick={handleCreateCampaign}
          size="lg"
          className="gap-2"
        >
          <Plus className="w-5 h-5" />
          Créer une campagne
        </Button>
      </div>

      {/* Section d'explication */}
      {showInfo && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" variant="primary">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  À propos des campagnes d&apos;inscription
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfo(false)}
                  className="text-blue-700 hover:text-blue-900 dark:text-blue-300 -mt-1 -mr-2"
                >
                  ✕
                </Button>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                Une campagne regroupe l&apos;ensemble des dossiers d&apos;inscription pour une période scolaire donnée (ex: rentrée 2024-2025).
              </p>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Période :</strong> Définissez les dates de début et de fin de la campagne</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Génération :</strong> Créez automatiquement les dossiers pour tous les élèves existants</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Envoi :</strong> Les familles reçoivent un email avec un lien d&apos;accès unique à leur dossier</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Suivi :</strong> Consultez l&apos;état d&apos;avancement de chaque dossier (brouillon, soumis, validé, etc.)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Liste des campagnes */}
      <CampaignList
        campaigns={campaigns?.data || []}
        loading={isLoading}
        onEdit={handleEditCampaign}
        onDelete={handleDeleteCampaign}
      />
    </div>
  );
}



