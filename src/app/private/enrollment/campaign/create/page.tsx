"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardFluo } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui";
import { Calendar } from "@/components/ui/calendar.21st";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Save } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCreateEnrollmentCampaign } from "@/hooks";
import { toast } from "sonner";

export default function CreateCampaignPage() {
  const router = useRouter();
  const createCampaign = useCreateEnrollmentCampaign();

  const [formData, setFormData] = useState({
    name: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validation : la date de fin doit être après la date de début
    if (formData.endDate <= formData.startDate) {
      toast.error("La date de fin doit être après la date de début");
      return;
    }

    createCampaign.mutate({
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
    }, {
      onSuccess: (data) => {
        const id = data.data?.id;
        if (id) {
          router.push(`/private/enrollment/campaign/${id}`);
        }
      },
    });
  };

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6 container mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/private/enrollment/campaign" className={buttonVariants({ variant: "outline", color: "secondary" })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Créer une campagne d&apos;inscription</h1>
          <p className="text-sm text-gray-500">
            Définissez la période et les paramètres de votre campagne
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <CardFluo className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom de la campagne */}
            <div className="md:col-span-2 space-y-2">
              <Input
                label="Nom de la campagne *"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Inscription 2024-2025"
                required
                helperText="Choisissez un nom explicite pour identifier facilement cette campagne"
              />
            </div>

            {/* Date de début */}
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Date de début *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-input bg-background text-foreground",
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
                    onSelect={(date) => handleInputChange("startDate", date as Date)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Date d&apos;ouverture de la campagne
              </p>
            </div>

            {/* Date de fin */}
            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                Date de fin *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline" 
            
                    className={cn(
                      "w-full justify-start text-left font-normal border-input bg-background text-foreground",
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
                    onSelect={(date) => handleInputChange("endDate", date as Date)}
                    initialFocus
                    locale={fr}
                    disabled={(date) => 
                      formData.startDate ? date < formData.startDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Date de clôture de la campagne
              </p>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ℹ️ Que se passe-t-il après la création ?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>La campagne sera créée et accessible dans la liste</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Vous pourrez générer automatiquement les dossiers pour tous les élèves</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Les familles recevront un email d&apos;invitation avec un lien unique</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Vous pourrez suivre l&apos;avancement en temps réel</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Link href="/private/enrollment/campaign">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={createCampaign.isPending || !formData.name || !formData.startDate || !formData.endDate}
            >
              <Save className="w-4 h-4 mr-2" />
              {createCampaign.isPending ? "Création..." : "Créer la campagne"}
            </Button>
          </div>
        </form>
      </CardFluo>
    </div>
  );
}

