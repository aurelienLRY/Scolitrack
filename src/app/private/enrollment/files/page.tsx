"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Search, Filter, Download, FileText } from "lucide-react";
import { EnrollmentFileCard, QuickSendWidget } from "@/components/enrollment-campaign";
import { useEnrollmentFiles } from "@/hooks";
import type { EnrollmentFileWithDetails } from "@/types/enrollment.type";
import type { EnrollmentStatus } from "@prisma/client";

export default function EnrollmentFilesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Récupération des dossiers avec les hooks TanStack Query
  const { data: filesData, isLoading, error } = useEnrollmentFiles({
    status:
      statusFilter === "all"
        ? undefined
        : (statusFilter as EnrollmentStatus),
  });

  const files = filesData?.data || [];

  const handleEditFile = (file: EnrollmentFileWithDetails) => {
    // Redirection vers la page d'édition du dossier
    router.push(`/private/enrollment/files/${file.id}/edit`);
  };

  const handleViewFile = (file: EnrollmentFileWithDetails) => {
    // Redirection vers la page de visualisation du dossier
    router.push(`/private/enrollment/files/${file.id}`);
  };

  // Gestion des erreurs
  if (error) {
    return (
      <div className="space-y-6 container mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Erreur lors du chargement des dossiers</p>
          <Button onClick={() => router.refresh()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 container mx-auto">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale - Liste des dossiers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Dossiers d&apos;inscription</h1>
              <p className="text-sm text-muted-foreground">
                Gérez tous les dossiers d&apos;inscription
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>

          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par email ou nom de famille..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="SUBMITTED">Soumis</SelectItem>
                  <SelectItem value="NEED_INFO">À compléter</SelectItem>
                  <SelectItem value="APPROVED">Approuvé</SelectItem>
                  <SelectItem value="REJECTED">Refusé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Liste des dossiers */}
          <div className="space-y-4">
            {files.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun dossier trouvé</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== "all" 
                    ? "Aucun dossier ne correspond à vos critères de recherche"
                    : "Aucun dossier d'inscription n'a encore été créé"
                  }
                </p>
              </div>
            ) : (
              files.map((file) => (
                <EnrollmentFileCard
                  key={`${file.id}-${file.deletedAt ?? "active"}`}
                  file={file}
                  onEdit={handleEditFile}
                  onView={handleViewFile}
                />
              ))
            )}
          </div>
        </div>

        {/* Colonne latérale - Widget d'envoi rapide */}
        <div className="lg:col-span-1">
          <QuickSendWidget />
        </div>
      </div>
  );
}
