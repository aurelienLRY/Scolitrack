import { Card } from "@/components/ui";
import { FileText, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface CampaignStatsProps {
  stats: {
    totalFiles: number;
    submittedFiles: number;
    approvedFiles: number;
    rejectedFiles: number;
    pendingFiles: number;
  };
}

export default function CampaignStats({ stats }: CampaignStatsProps) {
  const statItems = [
    {
      icon: FileText,
      label: "Total",
      value: stats.totalFiles,
      color: "text-blue-500",
    },
    {
      icon: Users,
      label: "Soumis",
      value: stats.submittedFiles,
      color: "text-orange-500",
    },
    {
      icon: () => <div className="w-5 h-5 bg-green-500 rounded" />,
      label: "Approuvés",
      value: stats.approvedFiles,
      color: "text-green-500",
    },
    {
      icon: () => <div className="w-5 h-5 bg-red-500 rounded" />,
      label: "Refusés",
      value: stats.rejectedFiles,
      color: "text-red-500",
    },
    {
      icon: Calendar,
      label: "En attente",
      value: stats.pendingFiles,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="p-4" variant="primary">
            <div className="flex items-center gap-2">
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
