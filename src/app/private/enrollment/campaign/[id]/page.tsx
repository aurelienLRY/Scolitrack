"use client";

import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { 
  ArrowLeft, 
  Plus,
  Edit,
  Trash2,
  Download
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CampaignStats, SkeletonCampaignStats, EnrollmentFileCard } from "@/components/enrollment-campaign";
import { 
  useEnrollmentCampaign, 
  useEnrollmentFiles,
  useDeleteEnrollmentCampaign,
  useEnrollmentStats
} from "@/hooks";
import { toast } from "sonner";
import type { EnrollmentFileWithDetails } from "@/types/enrollment.type";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  // Récupération des données avec les hooks TanStack Query
  const { data: campaignData, isLoading: campaignLoading, error: campaignError } = useEnrollmentCampaign(campaignId);
  const { data: filesData, isLoading: filesLoading } = useEnrollmentFiles({ campaignId });
  const deleteCampaign = useDeleteEnrollmentCampaign();

  const campaign = campaignData?.data;
  const files = filesData?.data || [];

  // Calcul des statistiques avec le hook personnalisé
  const stats = useEnrollmentStats(files);

  const loading = campaignLoading || filesLoading;

  const handleEditFile = (file: EnrollmentFileWithDetails) => {
    // Redirection vers la page d'édition du dossier
    router.push(`/private/enrollment/files/${file.id}/edit`);
  };

  const handleViewFile = (file: EnrollmentFileWithDetails) => {
    // Redirection vers la page de visualisation du dossier
    router.push(`/private/enrollment/files/${file.id}`);
  };

  const handleDeleteCampaign = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la campagne "${campaign?.name}" ?`)) {
      deleteCampaign.mutate(campaignId, {
        onSuccess: () => {
          toast.success("Campagne supprimée avec succès");
          router.push("/private/enrollment/campaign");
        },
        onError: (error) => {
          toast.error("Erreur lors de la suppression de la campagne");
          console.error("Erreur:", error);
        }
      });
    }
  };

  // Gestion des erreurs
  if (campaignError) {
    return (
      <div className="text-center container mx-auto">
        <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
        <p className="text-gray-500 mb-4">Impossible de charger les données de la campagne.</p>
        <Button onClick={() => router.refresh()}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 container mx-auto">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <SkeletonCampaignStats />
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center container mx-auto">
        <h2 className="text-xl font-semibold mb-2">Campagne non trouvée</h2>
        <p className="text-gray-500 mb-4">Cette campagne d&apos;inscription n&apos;existe pas.</p>
        <Link href="/private/enrollment/campaign">
          <Button variant="outline" >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux campagnes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/private/enrollment/campaign">
          <Button variant="solid" size="sm" color="accent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <p className="text-sm text-gray-500">
            Créée le {format(new Date(campaign.createdAt), "dd MMMM yyyy", { locale: fr })} par {campaign.creator?.name || "Utilisateur"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/private/enrollment/campaign/${campaignId}/edit`}>
            <Button variant="outline" color="warning"
            tooltip="Modifier">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </Link>
          <Button 
            variant="outline" 
            color="destructive"
            onClick={handleDeleteCampaign}
            tooltip="Supprimer"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && <CampaignStats stats={stats} />}

      {/* Onglets */}
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">Dossiers d&apos;inscription</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Dossiers d&apos;inscription</h3>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter des dossiers
              </Button>
            </div>
          </div>

          <Card className="p-6" variant="primary">
            <div className="space-y-4">
              {files.map((file) => (
                <EnrollmentFileCard
                  key={file.id}
                  file={file}
                  onEdit={handleEditFile}
                  onView={handleViewFile}
                />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6" variant="primary">
            <h3 className="text-lg font-semibold mb-4">Paramètres de la campagne</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Période</label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(campaign.startDate), "dd MMMM yyyy", { locale: fr })} - 
                  {format(new Date(campaign.endDate), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Créateur</label>
                <p className="text-sm text-muted-foreground">
                  {campaign.creator?.name || "Utilisateur"} ({campaign.creator?.email || "N/A"})
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
