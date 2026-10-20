import { Card, Button, Badge } from "@/components/ui";
import { FileText, Edit, Mail, Trash2, Undo2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  useResendEnrollmentInvitation,
  useDeleteEnrollmentFile,
  useRestoreEnrollmentFile,
} from "@/hooks";
import type { EnrollmentFileWithDetails } from "@/types/enrollment.type";
import {
  enrollmentStatusLabel,
  enrollmentStatusVariant,
} from "@/lib/enrollment/status-badge";
import {
  ENROLLMENT_SOFT_DELETE_RETENTION_DAYS,
  enrollmentSoftDeletePurgeAt,
} from "@/lib/enrollment/soft-delete";
import { enrollmentChildLabels } from "@/lib/enrollment/child-labels";

interface EnrollmentFileCardProps {
  file: EnrollmentFileWithDetails;
  onEdit?: (file: EnrollmentFileWithDetails) => void;
  onView?: (file: EnrollmentFileWithDetails) => void;
}

export default function EnrollmentFileCard({
  file,
  onEdit,
  onView,
}: EnrollmentFileCardProps) {
  const isDeleted = !!file.deletedAt;
  const childNames = enrollmentChildLabels(file);
  const getStatusBadge = (status: string) => (
    <Badge variant={enrollmentStatusVariant(status)} styleVariant="outline">
      {enrollmentStatusLabel(status)}
    </Badge>
  );

  const resend = useResendEnrollmentInvitation(file.id);
  const deleteFile = useDeleteEnrollmentFile();
  const restoreFile = useRestoreEnrollmentFile();

  const handleDelete = () => {
    const label = file.family?.name || file.email;
    if (
      !confirm(
        `Mettre le dossier « ${label} » en corbeille ?\n\nCe n’est pas une suppression immédiate : le dossier restera récupérable pendant ${ENROLLMENT_SOFT_DELETE_RETENTION_DAYS} jours. Passé ce délai, il sera définitivement effacé.`
      )
    ) {
      return;
    }
    // Feedback toast géré par useApiMutation (évite les doubles messages)
    deleteFile.mutate(file.id);
  };

  const handleRestore = () => {
    restoreFile.mutate(file.id);
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
        className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
          isDeleted ? "opacity-70 border-dashed" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h4 className="font-semibold text-foreground">
                {file.family?.name || file.email}
              </h4>
              {getStatusBadge(file.status)}
              {isDeleted && (
                <Badge variant="destructive" styleVariant="outline">
                  Corbeille
                  {file.deletedAt
                    ? ` · jusqu’au ${format(
                        enrollmentSoftDeletePurgeAt(file.deletedAt),
                        "dd MMM yyyy",
                        { locale: fr }
                      )}`
                    : ""}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Email: {file.email}</p>
              <p>
                Élève{childNames.length > 1 ? "s" : ""} :{" "}
                {childNames.length > 0 ? childNames.join(", ") : "—"}
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
            {!isDeleted && (
              <>
                <Button
                  variant="outline"
                  color="secondary"
                  size="sm"
                  tooltip="Renvoyer le lien par email"
                  aria-label="Renvoyer le lien par email"
                  onClick={() => resend.mutate(undefined)}
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
              </>
            )}
            {isDeleted ? (
              <Button
                variant="outline"
                color="success"
                size="sm"
                tooltip="Récupérer le dossier"
                aria-label="Récupérer le dossier"
                onClick={handleRestore}
                disabled={restoreFile.isPending}
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                color="destructive"
                size="sm"
                tooltip="Mettre en corbeille"
                aria-label="Mettre en corbeille"
                onClick={handleDelete}
                disabled={deleteFile.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
