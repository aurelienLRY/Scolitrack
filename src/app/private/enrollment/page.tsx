"use client";

import { Card } from "@/components/ui";
import { ActionCard, SkeletonCampaignCard, SkeletonCampaignStats } from "@/components/enrollment-campaign";
import { enrollmentNavItems } from "./enrollment-NavItem.data";
import { 
  useEnrollmentCampaigns, 
  useEnrollmentFiles,
  useEnrollmentStats,
} from "@/hooks";
import { EnrollmentCampaignComplete } from "@/types/enrollment.type";
import { FileText, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EnrollmentDashboard() {
  // Récupération des données avec les hooks TanStack Query
  const { data: campaignsData, isLoading: campaignsLoading } = useEnrollmentCampaigns();
  const { data: filesData, isLoading: filesLoading } = useEnrollmentFiles({});

  const campaigns = campaignsData?.data || [];
  const files = filesData?.data || [];
  const stats = useEnrollmentStats(files);

  // Fonction pour déterminer le statut de la campagne
  function getCampaignStatus(startDate: Date, endDate: Date): "active" | "upcoming" | "past" {
    const now = new Date();
    if (now < new Date(startDate)) return "upcoming";
    if (now > new Date(endDate)) return "past";
    return "active";
  }

  // Filtrer les campagnes actives et les dossiers en cours
  const activeCampaigns = campaigns.filter(
    (c: EnrollmentCampaignComplete) => getCampaignStatus(c.startDate, c.endDate) === "active"
  );

  const inProgressFiles = files.filter(
    (f: { status: string }) => f.status === "SUBMITTED" || f.status === "NEED_INFO"
  );

  const loading = campaignsLoading || filesLoading;

  return (
    <div className="space-y-8 o">
      {/* Section des liens principaux */}
      <section className="flex justify-center items-center gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
          {enrollmentNavItems.map((item, index) => (
            <ActionCard
              key={index}
              label={item.label}
              href={item.href}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </div>
      </section>

      {/* Section Vue d'ensemble - Seulement si des données existent */}
      {!loading && (campaigns.length > 0 || files.length > 0) && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Vue d&apos;ensemble</h2>

          {/* Statistiques globales */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4" variant="primary">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total dossiers</p>
                  <p className="text-2xl font-bold">{stats.totalFiles}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4" variant="primary">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Approuvés</p>
                  <p className="text-2xl font-bold">{stats.approvedFiles}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4" variant="primary">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Soumis</p>
                  <p className="text-2xl font-bold">{stats.submittedFiles}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4" variant="primary">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">À compléter</p>
                  <p className="text-2xl font-bold">{stats.needInfoFiles}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4" variant="primary">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Brouillon</p>
                  <p className="text-2xl font-bold">{stats.draftFiles}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Campagnes actives */}
          {activeCampaigns.length > 0 && (
            <div className="space-y-4">

              {activeCampaigns.length > 1 && (
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Campagnes actives</h3>
                <Link href="/private/enrollment/campaign" className="text-sm text-primary hover:underline">
                  Voir toutes les campagnes →
                </Link>
              </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCampaigns.slice(0, 3).map((campaign: EnrollmentCampaignComplete) => (
                  <Link key={campaign.id} href={`/private/enrollment/campaign/${campaign.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" variant="primary">
                      <h4 className="font-semibold mb-2">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {campaign._count?.enrollmentFiles || 0} dossiers
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Dossiers en cours de traitement */}
          {inProgressFiles.length > 0 && (
            <div className="space-y-4">
              {inProgressFiles.length > 1 && (
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Dossiers en cours de traitement</h3>
                <Link href="/private/enrollment/files" className="text-sm text-primary hover:underline">
                  Voir tous les dossiers →
                </Link>
              </div>
              )}
              <Card className="p-6" variant="primary">
                <div className="space-y-3">
                  {inProgressFiles.slice(0, 5).map((file: { id: string; family?: { name: string }; email: string; campaign?: { name: string }; status: string; students?: unknown[] }) => (
                    <Link 
                      key={file.id} 
                      href={`/private/enrollment/files/${file.id}`}
                      className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-medium">{file.family?.name || file.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.campaign?.name} - {file.status === "SUBMITTED" ? "Soumis" : "À compléter"}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {file.students?.length || 0} élève(s)
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </section>
      )}

      {/* État de chargement */}
      {loading && (
        <section className="space-y-6 ">
              <SkeletonCampaignStats  />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCampaignCard key={i} />
            ))}
          </div>
        </section>
      )}

      {/* État vide */}
      {!loading && campaigns.length === 0 && files.length === 0 && (
        <section className="text-center py-12">
          <div className="max-w-md mx-auto">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucune donnée disponible</h3>
            <p className="text-muted-foreground mb-6">
              Commencez par créer une campagne d&apos;inscription pour gérer les inscriptions scolaires.
            </p>
            <Link href="/private/enrollment/campaign">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-primary/5" variant="primary">
                <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">Créer votre première campagne</p>
              </Card>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

EnrollmentDashboard.displayName = "EnrollmentDashboard";