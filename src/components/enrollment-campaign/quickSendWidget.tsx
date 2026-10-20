"use client";

import { useState } from "react";
import { CardFluo } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Send } from "lucide-react";
import { useEnrollmentCampaigns, useCreateEnrollmentFile, useEnrollmentFiles, useEnrollmentStats } from "@/hooks";
import { toast } from "sonner";
import type { EnrollmentCampaignComplete } from "@/types/enrollment.type";

interface QuickSendWidgetProps {
  onSuccess?: () => void;
}

export function QuickSendWidget({ onSuccess }: QuickSendWidgetProps) {
  const [campaignId, setCampaignId] = useState("");
  const [email, setEmail] = useState("");
  
  const { data: campaignsData } = useEnrollmentCampaigns();
  const createFile = useCreateEnrollmentFile();
  const { data: filesData } = useEnrollmentFiles({});
  
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

  const activeCampaigns = campaigns.filter(
    (c: EnrollmentCampaignComplete) =>
      getCampaignStatus(c.startDate, c.endDate) === "active"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaignId || !email) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    createFile.mutate(
      { campaignId, email },
      {
        onSuccess: () => {
          setCampaignId("");
          setEmail("");
          onSuccess?.();
        },
      }
    );
  };

  return (
    <CardFluo className="sticky top-4 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Send className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Envoi rapide</h3>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Campagne *</label>
          <Select value={campaignId} onValueChange={setCampaignId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une campagne" />
            </SelectTrigger>
            <SelectContent>
              {activeCampaigns.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  Aucune campagne active
                </div>
              ) : (
                activeCampaigns.map((campaign: EnrollmentCampaignComplete) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Input
            type="email"
            label="Email de la famille *"
            placeholder="famille@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={createFile.isPending || !campaignId || activeCampaigns.length === 0}
        >
          <Send className="w-4 h-4 mr-2" />
          {createFile.isPending ? "Envoi en cours..." : "Créer et envoyer"}
        </Button>

        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <span className="font-medium">ℹ️ Information :</span> Un dossier sera créé et un email d&apos;invitation sera envoyé automatiquement à cette adresse.
        </div>
      </form>

      {/* Statistiques rapides */}
      <div className="mt-6 pt-6 border-t space-y-3">
        <h4 className="text-sm font-semibold mb-3">📊 Statistiques globales</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total des dossiers</span>
            <span className="font-semibold text-lg">{stats.totalFiles}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-600">✅ Approuvés</span>
            <span className="font-semibold text-green-600">{stats.approvedFiles}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-600">📤 Soumis</span>
            <span className="font-semibold text-blue-600">{stats.submittedFiles}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-orange-600">⏳ À compléter</span>
            <span className="font-semibold text-orange-600">{stats.needInfoFiles}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">📝 Brouillon</span>
            <span className="font-semibold text-gray-600">{stats.draftFiles}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-red-600">❌ Refusés</span>
            <span className="font-semibold text-red-600">{stats.rejectedFiles}</span>
          </div>
        </div>
      </div>
    </CardFluo>
  );
}


