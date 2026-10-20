"use client";

import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from "@/components/ui";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Download,
  Users,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CampaignStats,
  SkeletonCampaignStats,
  EnrollmentFileCard,
} from "@/components/enrollment-campaign";
import {
  useEnrollmentCampaign,
  useEnrollmentFiles,
  useDeleteEnrollmentCampaign,
  useEnrollmentStats,
  useGenerateEnrollmentFiles,
} from "@/hooks";
import { toast } from "sonner";
import type { EnrollmentFileWithDetails } from "@/types/enrollment.type";
import { useState } from "react";
import { FetchService } from "@/lib/services/fetch.service";
import Modal, { ModalFooter } from "@/components/ui/modal";

function parseEmails(raw: string): string[] {
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const part of raw.split(/[\s,;]+/)) {
    const email = part.trim().toLowerCase();
    if (!email || !email.includes("@")) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }
  return emails;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const {
    data: campaignData,
    isLoading: campaignLoading,
    error: campaignError,
  } = useEnrollmentCampaign(campaignId);
  const { data: filesData, isLoading: filesLoading, refetch: refetchFiles } =
    useEnrollmentFiles({ campaignId });
  const deleteCampaign = useDeleteEnrollmentCampaign();
  const generateFiles = useGenerateEnrollmentFiles(campaignId);
  const [syncing, setSyncing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [emailsText, setEmailsText] = useState("");

  const campaign = campaignData?.data;
  const files = filesData?.data || [];
  const stats = useEnrollmentStats(files);

  const handleSyncStudents = async () => {
    if (
      !confirm(
        "Créer un dossier pour chaque famille déjà scolarisée (sans dossier dans cette campagne) ?"
      )
    ) {
      return;
    }
    setSyncing(true);
    try {
      const res = await FetchService.post<{ created: number; skipped: number }>(
        `/api/enrollment/campaigns/${campaignId}/sync-students`,
        {}
      );
      toast.success(
        res.feedback || `${res.data?.created ?? 0} dossier(s) créé(s)`
      );
      await refetchFiles();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur synchronisation élèves"
      );
    } finally {
      setSyncing(false);
    }
  };

  const loading = campaignLoading || filesLoading;

  const handleEditFile = (file: EnrollmentFileWithDetails) => {
    router.push(`/private/enrollment/files/${file.id}/edit`);
  };

  const handleViewFile = (file: EnrollmentFileWithDetails) => {
    router.push(`/private/enrollment/files/${file.id}`);
  };

  const handleDeleteCampaign = () => {
    if (!campaign) return;

    const filesCount = files.length;
    const endPassed = new Date(campaign.endDate) < new Date();

    if (!endPassed) {
      toast.error(
        "Impossible de supprimer une campagne dont la date de fin n'est pas encore passée"
      );
      return;
    }
    if (filesCount > 0) {
      toast.error(
        "Impossible de supprimer une campagne qui contient encore des dossiers (y compris en corbeille)"
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

    deleteCampaign.mutate(campaignId, {
      onSuccess: () => {
        router.push("/private/enrollment/campaign");
      },
    });
  };

  const canDeleteCampaign =
    !!campaign &&
    new Date(campaign.endDate) < new Date() &&
    files.length === 0;

  const handleAddFiles = () => {
    const emails = parseEmails(emailsText);
    if (emails.length === 0) {
      toast.error("Indiquez au moins une adresse email valide");
      return;
    }
    generateFiles.mutate(
      { emails },
      {
        onSuccess: () => {
          setEmailsText("");
          setAddOpen(false);
          void refetchFiles();
        },
      }
    );
  };

  if (campaignError) {
    return (
      <div className="container mx-auto text-center">
        <h2 className="mb-2 text-xl font-semibold">Erreur de chargement</h2>
        <p className="mb-4 text-gray-500">
          Impossible de charger les données de la campagne.
        </p>
        <Button onClick={() => router.refresh()}>Réessayer</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto space-y-6">
        <div className="h-8 animate-pulse rounded bg-gray-200"></div>
        <SkeletonCampaignStats />
        <div className="h-64 animate-pulse rounded bg-gray-200"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto text-center">
        <h2 className="mb-2 text-xl font-semibold">Campagne non trouvée</h2>
        <p className="mb-4 text-gray-500">
          Cette campagne d&apos;inscription n&apos;existe pas.
        </p>
        <Link href="/private/enrollment/campaign">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux campagnes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/private/enrollment/campaign">
          <Button variant="solid" size="sm" color="accent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <p className="text-sm text-gray-500">
            Créée le{" "}
            {format(new Date(campaign.createdAt), "dd MMMM yyyy", {
              locale: fr,
            })}{" "}
            par {campaign.creator?.name || "Utilisateur"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/private/enrollment/campaign/${campaignId}/edit`}>
            <Button variant="outline" color="warning" tooltip="Modifier">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
          <Button
            variant="outline"
            color="destructive"
            onClick={handleDeleteCampaign}
            disabled={!canDeleteCampaign || deleteCampaign.isPending}
            tooltip={
              canDeleteCampaign
                ? "Supprimer"
                : files.length > 0
                  ? "Des dossiers sont encore liés à cette campagne"
                  : "La date de fin n’est pas encore passée"
            }
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {stats && <CampaignStats stats={stats} />}

      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">Dossiers d&apos;inscription</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">
              Dossiers d&apos;inscription
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                color="secondary"
                onClick={handleSyncStudents}
                disabled={syncing}
              >
                <Users className="mr-2 h-4 w-4" />
                {syncing ? "Sync…" : "Élèves existants"}
              </Button>
              <Button variant="outline" disabled tooltip="Bientôt">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter des dossiers
              </Button>
            </div>
          </div>

          <Card className="p-6" variant="primary">
            {files.length === 0 ? (
              <div className="space-y-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucun dossier pour cette campagne.
                </p>
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter des dossiers
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {files.map((file) => (
                  <EnrollmentFileCard
                    key={`${file.id}-${file.deletedAt ?? "active"}`}
                    file={file}
                    onEdit={handleEditFile}
                    onView={handleViewFile}
                  />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6" variant="primary">
            <h3 className="mb-4 text-lg font-semibold">
              Paramètres de la campagne
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Période</label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(campaign.startDate), "dd MMMM yyyy", {
                    locale: fr,
                  })}{" "}
                  -{" "}
                  {format(new Date(campaign.endDate), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Créateur</label>
                <p className="text-sm text-muted-foreground">
                  {campaign.creator?.name || "Utilisateur"} (
                  {campaign.creator?.email || "N/A"})
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Ajouter des dossiers"
        description="Saisissez une ou plusieurs adresses email. Un dossier sera créé et une invitation envoyée pour chaque adresse."
        size="md"
      >
        <Textarea
          label="Emails des familles"
          placeholder={"famille1@exemple.com\nfamille2@exemple.com"}
          value={emailsText}
          onChange={(e) => setEmailsText(e.target.value)}
          rows={6}
          helperText="Séparez par une virgule, un point-virgule ou un retour à la ligne."
        />
        <ModalFooter>
          <Button
            variant="outline"
            color="secondary"
            onClick={() => setAddOpen(false)}
            disabled={generateFiles.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAddFiles}
            disabled={generateFiles.isPending || !emailsText.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            {generateFiles.isPending
              ? "Création…"
              : "Créer et envoyer les invitations"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
