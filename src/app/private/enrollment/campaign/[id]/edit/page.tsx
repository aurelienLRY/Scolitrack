"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CardFluo } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui";
import { Calendar } from "@/components/ui/calendar.21st";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Save } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEnrollmentCampaign, useUpdateEnrollmentCampaign } from "@/hooks";
import { toast } from "sonner";

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // Récupération de la campagne avec les hooks TanStack Query
  const { data: campaignData, isLoading, error } = useEnrollmentCampaign(campaignId);
  const updateCampaign = useUpdateEnrollmentCampaign(campaignId);

  const [formData, setFormData] = useState({
    name: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  // Chargement des données de la campagne dans le formulaire
  useEffect(() => {
    if (campaignData?.data) {
      const campaign = campaignData.data;
      setFormData({
        name: campaign.name,
        startDate: new Date(campaign.startDate),
        endDate: new Date(campaign.endDate),
      });
    }
  }, [campaignData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    updateCampaign.mutate({
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
    }, {
      onSuccess: () => {
        router.push(`/private/enrollment/campaign/${campaignId}`);
      },
    });
  };

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gestion des erreurs
  if (error) {
    return (
      <div className="space-y-6 container mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Erreur lors du chargement de la campagne</p>
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
    <div className="space-y-6 container mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/private/enrollment/campaign/${campaignId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Modifier la campagne</h1>
          <p className="text-sm text-gray-500">
            Modifiez les informations de la campagne d&apos;inscription
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <CardFluo className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom de la campagne */}
            <div className="space-y-2">
              <Input
                label="Nom de la campagne *"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Inscription 2024-2025"
                required
              />
            </div>

            {/* Date de début */}
            <div className="space-y-2">
              <label htmlFor="name">Date de début *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleInputChange("startDate", date)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date de fin */}
            <div className="space-y-2">
              <label htmlFor="name">Date de fin *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleInputChange("endDate", date)}
                    initialFocus
                    locale={fr}
                    disabled={(date) => 
                      formData.startDate ? date < formData.startDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Link href={`/private/enrollment/campaign/${campaignId}`}>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={updateCampaign.isPending || !formData.name || !formData.startDate || !formData.endDate}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateCampaign.isPending ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </CardFluo>
    </div>
  );
}
