import { Card, Button, Badge } from "@/components/ui";
import { FileText, Edit, Mail, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useResendEnrollmentInvitation, useDeleteEnrollmentFile } from "@/hooks";
import type { EnrollmentFileWithDetails } from "@/types/enrollment.type";

interface EnrollmentFileCardProps {
  file: EnrollmentFileWithDetails;
  onEdit?: (file: EnrollmentFileWithDetails) => void;
  onView?: (file: EnrollmentFileWithDetails) => void;
}

export default function EnrollmentFileCard({ 
  file, 
  onEdit, 
  onView 
}: EnrollmentFileCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="info" styleVariant="outline">Brouillon</Badge>;
      case "SUBMITTED":
        return <Badge variant="secondary" styleVariant="outline">Soumis</Badge>;
      case "NEED_INFO":
        return <Badge variant="warning" styleVariant="outline">À compléter</Badge>;
      case "APPROVED":
        return <Badge variant="success" styleVariant="outline">Approuvé</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" styleVariant="outline">Refusé</Badge>;
      default:
        return <Badge variant="info" styleVariant="outline">Inconnu</Badge>;
    }
  };

  const resend = useResendEnrollmentInvitation(file.id);
  const deleteFile = useDeleteEnrollmentFile();

  const handleDelete = () => {
    const label = file.family?.name || file.email;
    if (
      !confirm(
        `Supprimer définitivement le dossier « ${label} » ? Cette action est irréversible.`
      )
    ) {
      return;
    }
    deleteFile.mutate(file.id, {
      onSuccess: () => toast.success("Dossier supprimé"),
      onError: (err: unknown) =>
        toast.error(
          err instanceof Error ? err.message : "Erreur lors de la suppression"
        ),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="p-4 border rounded-lg hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold text-foreground">
                {file.family?.name || file.email}
              </h4>
              {getStatusBadge(file.status)}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Email: {file.email}</p>
              <p>
                Étudiants:{" "}
                {file.students
                  .map((s) => `${s.student.firstName} ${s.student.lastName}`)
                  .join(", ")}
              </p>
              {file.submittedAt != null && (
                <p>
                  Soumis le:{" "}
                  {format(new Date(file.submittedAt), "dd MMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 ml-4 shrink-0">
           
            <Button
              variant="solid"
              size="sm"
              onClick={() => onView?.(file)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Voir
            </Button>
            <Button
              variant="outline"
              color="secondary"
              size="sm"
              tooltip="Renvoyer le lien par email"
              aria-label="Renvoyer le lien par email"
              onClick={() =>
                resend.mutate(undefined, {
                  onSuccess: () => toast.success("Email d'invitation renvoyé"),
                  onError: (err: unknown) =>
                    toast.error(err instanceof Error ? err.message : "Erreur lors du renvoi"),
                })
              }
              disabled={resend.isPending}
          
            >
              <Mail className="w-4 h-4" />
            </Button>


            <Button
              variant="outline"
              color="warning"
              size="sm"
              onClick={() => onEdit?.(file)}
              tooltip="Modifier le dossier"
              aria-label="Modifier le dossier"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              color="destructive"
              size="sm"
              
              tooltip="Supprimer le dossier"
              aria-label="Supprimer le dossier"
              onClick={handleDelete}
              disabled={deleteFile.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
