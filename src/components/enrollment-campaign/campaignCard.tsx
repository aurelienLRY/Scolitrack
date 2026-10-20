import { Card, Button, Badge } from "@/components/ui";
import { Calendar, FileText, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  filesCount: number;
  status: "active" | "upcoming" | "past";
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (campaign: Campaign) => void;
}

const ICONS_SIZE = 4;

function canDeleteCampaign(campaign: Campaign): {
  allowed: boolean;
  reason?: string;
} {
  if (campaign.status !== "past") {
    return {
      allowed: false,
      reason:
        "La date de fin de la campagne n’est pas encore passée",
    };
  }
  if (campaign.filesCount > 0) {
    return {
      allowed: false,
      reason:
        "Des dossiers sont encore liés à cette campagne (y compris en corbeille)",
    };
  }
  return { allowed: true };
}

export default function CampaignCard({ 
  campaign, 
  onDelete 
}: CampaignCardProps) {
  const deleteCheck = canDeleteCampaign(campaign);
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success" className="bg-green-500">Active</Badge>;
      case "upcoming":
        return <Badge variant="warning" styleVariant="outline">À venir</Badge>;
      case "past":
        return <Badge variant="info" styleVariant="outline">Terminée</Badge>;
      default:
        return <Badge variant="info" styleVariant="outline">Inconnu</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card
        className="h-full p-6 flex flex-col gap-4 hover:shadow-lg transition-all duration-300"
        variant="primary"
      >
        {/* Header avec nom et statut */}
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-foreground">
            {campaign.name}
          </h3>
          {getStatusBadge(campaign.status)}
        </div>

        {/* Informations de la campagne */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className={`w-${ICONS_SIZE} h-${ICONS_SIZE}`} />
            <span className="text-sm">
              {format(new Date(campaign.startDate), "dd MMM yyyy", { locale: fr })} - 
              {format(new Date(campaign.endDate), "dd MMM yyyy", { locale: fr })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className={`w-${ICONS_SIZE} h-${ICONS_SIZE}`} />
            <span className="text-sm">{campaign.filesCount} dossiers</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/private/enrollment/campaign/${campaign.id}`}>
            <Button variant="solid" color="secondary" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Voir
            </Button>
          </Link>
          <Link href={`/private/enrollment/campaign/${campaign.id}/edit`}>
            <Button variant="outline" color="warning" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            color="destructive"
            size="sm" 
            onClick={() => onDelete?.(campaign)}
            disabled={!deleteCheck.allowed}
            tooltip={
              deleteCheck.allowed
                ? "Supprimer la campagne"
                : deleteCheck.reason
            }
            aria-label={
              deleteCheck.allowed
                ? "Supprimer la campagne"
                : deleteCheck.reason
            }
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
