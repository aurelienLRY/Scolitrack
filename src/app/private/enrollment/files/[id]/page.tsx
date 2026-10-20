"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Badge } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useEnrollmentFile,
  useResendEnrollmentInvitation,
  useDeleteEnrollmentFile,
} from "@/hooks";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  Pencil,
  ExternalLink,
  Trash2,
  FileDown,
  Sheet,
  ChevronDown,
  Eye,
} from "lucide-react";
import PublicEnrollmentForm from "@/components/enrollment-form/PublicEnrollmentForm";
import EnrollmentFileChecklist from "@/components/enrollment-form/EnrollmentFileChecklist";
import EnrollmentFileHistory from "@/components/enrollment-form/EnrollmentFileHistory";

export default function EnrollmentFileDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id;
  const id =
    typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] ?? "" : "";
  const { data, isLoading, error } = useEnrollmentFile(id);
  const resendInvitation = useResendEnrollmentInvitation(id);
  const deleteFile = useDeleteEnrollmentFile();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return notFound();

  const file = data?.data;
  if (!file) return notFound();

  const statusLabel: Record<string, string> = {
    DRAFT: "Brouillon",
    SUBMITTED: "Soumis",
    NEED_INFO: "A compléter",
    APPROVED: "Approuvé",
    REJECTED: "Refusé",
  };

  const statusVariant: Record<
    string,
    "info" | "secondary" | "warning" | "success" | "destructive"
  > = {
    DRAFT: "info",
    SUBMITTED: "secondary",
    NEED_INFO: "warning",
    APPROVED: "success",
    REJECTED: "destructive",
  };

  const handleResend = () => {
    resendInvitation.mutate(undefined, {
      onSuccess: () => toast.success("Email d'invitation renvoyé"),
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Erreur lors du renvoi"),
    });
  };

  const handleDelete = () => {
    const label = file.family?.name || file.email;
    if (
      !confirm(
        `Supprimer définitivement le dossier « ${label} » ? Cette action est irréversible.`
      )
    ) {
      return;
    }
    deleteFile.mutate(id, {
      onSuccess: () => {
        toast.success("Dossier supprimé");
        if (file.campaign?.id) {
          router.push(`/private/enrollment/campaign/${file.campaign.id}`);
        } else {
          router.push("/private/enrollment/files");
        }
      },
      onError: (err: unknown) =>
        toast.error(
          err instanceof Error ? err.message : "Erreur lors de la suppression"
        ),
    });
  };

  const handleExportPdf = () => {
    window.open(`/api/enrollment/files/${id}/export?format=html`, "_blank");
  };

  const handleExportCsv = () => {
    window.open(`/api/enrollment/files/${id}/export?format=csv`, "_blank");
  };

  return (
    <div className="container mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold sm:text-2xl">
          Dossier d&apos;inscription
        </h1>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" color="secondary">
                <FileDown className="mr-2 h-4 w-4" />
                Exporter
                <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPdf}>
                <FileDown className="mr-2 h-4 w-4" />
                Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCsv}>
                <Sheet className="mr-2 h-4 w-4" />
                Exporter en CSV (Excel)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            color="secondary"
            onClick={handleResend}
            disabled={resendInvitation.isPending}
          >
            <Mail className="mr-2 h-4 w-4" />
            Renvoyer le mail
          </Button>
          <Link href={`/private/enrollment/files/${id}/edit`}>
            <Button variant="outline" color="warning">
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
          <Link href={`/enrollment/${file.token}`} target="_blank">
            <Button variant="ghost" color="accent">
              <ExternalLink className="mr-2 h-4 w-4" />
              Lien public
            </Button>
          </Link>
          <Button
            variant="outline"
            color="destructive"
            onClick={handleDelete}
            disabled={deleteFile.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="space-y-1.5 p-3" variant="primary">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Infos</h2>
            <Badge
              variant={statusVariant[file.status] ?? "info"}
              styleVariant="outline"
              className="text-[10px]"
            >
              {statusLabel[file.status] ?? file.status}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {file.email}
          </p>
          <p className="text-xs text-muted-foreground">
            Campagne : {file.campaign?.name ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            Famille : {file.family?.name ?? "Non associée"}
          </p>
          {file.decisionNote ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              Note : {file.decisionNote}
            </p>
          ) : null}
        </Card>

        <EnrollmentFileChecklist
          fileToken={file.token}
          formPayload={file.parsedFormPayload}
          fallbackEmail={file.email}
        />

        <EnrollmentFileHistory history={file.history ?? []} />

        <Card className="space-y-1.5 p-3" variant="primary">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Consultation</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-snug">
            Formulaire en lecture seule ci-dessous. Utilisez « Modifier » pour
            changer les champs ou le statut.
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {file.campaign?.name ? `${file.campaign.name} · ` : ""}
            {file.email}
          </p>
        </Card>
      </div>

      <PublicEnrollmentForm
        token={file.token}
        file={file}
        mode="staff-view"
        compactHeader
      />
    </div>
  );
}
