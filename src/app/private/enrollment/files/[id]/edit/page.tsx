"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  useEnrollmentFile,
  useUpdateEnrollmentFile,
  useUpdateEnrollmentFileStatus,
} from "@/hooks";
import {
  Button,
  Card,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import PublicEnrollmentForm from "@/components/enrollment-form/PublicEnrollmentForm";
import { FetchService } from "@/lib/services/fetch.service";

type FamilyOption = {
  id: string;
  name: string;
  _count?: { students: number };
};

export default function EditEnrollmentFilePage() {
  const params = useParams();
  const rawId = params.id;
  const id =
    typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] ?? "" : "";

  const { data, isLoading, error } = useEnrollmentFile(id);
  const updateFile = useUpdateEnrollmentFile(id);
  const updateStatus = useUpdateEnrollmentFileStatus(id);

  const file = data?.data;

  const [email, setEmail] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [familyId, setFamilyId] = useState<string>("");
  const [status, setStatus] = useState<
    "DRAFT" | "SUBMITTED" | "NEED_INFO" | "APPROVED" | "REJECTED"
  >("DRAFT");

  const { data: familiesData } = useQuery({
    queryKey: ["families-list"],
    queryFn: async () => {
      const res = await FetchService.get<FamilyOption[]>("/api/families");
      return res.data ?? [];
    },
  });

  useEffect(() => {
    if (!file) return;
    setEmail(file.email);
    setDecisionNote(file.decisionNote ?? "");
    setStatus(file.status);
    setFamilyId(file.familyId ?? "");
  }, [file]);

  if (isLoading) return <div>Chargement...</div>;
  if (error) return notFound();
  if (!file) return notFound();

  const saveMetadata = () => {
    // Feedback toast géré par useApiMutation
    updateFile.mutate({
      email,
      decisionNote: decisionNote || undefined,
      familyId: familyId || null,
    });
  };

  const saveStatus = () => {
    if (status === "NEED_INFO" && !decisionNote.trim()) {
      toast.error(
        "Indiquez une note pour le parent (obligatoire pour « A compléter »)"
      );
      return;
    }
    updateStatus.mutate({ status, note: decisionNote || undefined });
  };

  return (
    <div className="container mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modifier le dossier</h1>
        <Link href={`/private/enrollment/files/${id}`}>
          <Button variant="ghost">Retour à la consultation</Button>
        </Link>
      </div>

      <Card className="p-4 space-y-4" variant="primary">
        <Input
          label="Email de contact"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Famille associée</label>
          <Select
            value={familyId || "__none__"}
            onValueChange={(v) => setFamilyId(v === "__none__" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une famille" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Aucune</SelectItem>
              {(familiesData ?? []).map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                  {f._count?.students != null
                    ? ` (${f._count.students} élève(s))`
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Textarea
          label="Note (complément / décision)"
          value={decisionNote}
          onChange={(e) => setDecisionNote(e.target.value)}
          inputSize="default"
          helperText={
            status === "NEED_INFO"
              ? "Obligatoire : cette note est envoyée par email au parent"
              : undefined
          }
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Statut</label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as typeof status)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir le statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Brouillon</SelectItem>
              <SelectItem value="SUBMITTED">Soumis</SelectItem>
              <SelectItem value="NEED_INFO">A compléter</SelectItem>
              <SelectItem value="APPROVED">Approuvé</SelectItem>
              <SelectItem value="REJECTED">Refusé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={saveMetadata} disabled={updateFile.isPending}>
            Enregistrer les infos
          </Button>
          <Button
            variant="outline"
            color="warning"
            onClick={saveStatus}
            disabled={updateStatus.isPending}
          >
            Mettre à jour le statut
          </Button>
        </div>
      </Card>

      <PublicEnrollmentForm
        token={file.token}
        file={file}
        mode="staff-edit"
      />
    </div>
  );
}
