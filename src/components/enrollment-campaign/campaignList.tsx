import { Card } from "@/components/ui";
import { Calendar } from "lucide-react";
import CampaignCard from "./campaignCard";
import SkeletonCampaignCard from "./skeletonCampaignCard";
import { EnrollmentCampaignComplete } from "@/types/enrollment.type";

interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  filesCount: number;
  status: "active" | "upcoming" | "past";
}

interface CampaignListProps {
  campaigns: EnrollmentCampaignComplete[];
  loading: boolean;
  onEdit?: (campaign: EnrollmentCampaignComplete) => void;
  onDelete?: (campaign: EnrollmentCampaignComplete) => void;
}

export default function CampaignList({ 
  campaigns, 
  loading, 
  onEdit, 
  onDelete 
}: CampaignListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <SkeletonCampaignCard key={i} />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="p-12 text-center" variant="primary">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucune campagne</h3>
        <p className="text-muted-foreground mb-6">
          Créez votre première campagne d&apos;inscription pour commencer
        </p>
        <p className="text-sm text-muted-foreground">
          (Fonctionnalité de création à venir)
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2  gap-6">
      {campaigns.map((campaign) => {
        // Fonction pour déterminer le statut de la campagne
        const getCampaignStatus = (startDate: Date, endDate: Date): "active" | "upcoming" | "past" => {
          const now = new Date();
          if (now < new Date(startDate)) return "upcoming";
          if (now > new Date(endDate)) return "past";
          return "active";
        };

        const campaignForCard: Campaign = {
          id: campaign.id,
          name: campaign.name,
          startDate: campaign.startDate.toString(),
          endDate: campaign.endDate.toString(),
          createdAt: campaign.createdAt.toString(),
          filesCount: campaign._count?.enrollmentFiles || 0,
          status: getCampaignStatus(campaign.startDate, campaign.endDate),
        };

        return (
          <CampaignCard
            key={campaign.id}
            campaign={campaignForCard}
            onEdit={onEdit ? () => onEdit(campaign) : undefined}
            onDelete={onDelete ? () => onDelete(campaign) : undefined}
          />
        );
      })}
    </div>
  );
}
