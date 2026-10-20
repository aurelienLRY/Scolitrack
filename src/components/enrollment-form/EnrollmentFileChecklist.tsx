"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, Badge } from "@/components/ui";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { evaluateEnrollmentCompleteness } from "@/lib/enrollment/completeness";
import type { EnrollmentFormPayload } from "@/types/enrollment-form.type";
import {
  createEmptyFormPayload,
  normalizeFormPayload,
} from "@/types/enrollment-form.type";

type DocRow = {
  category: string;
  scopeRef?: string | null;
};

type SigRow = {
  subjectKey: string;
  scopeRef?: string | null;
  email?: string | null;
  status: string;
};

type Props = {
  fileToken: string;
  formPayload?: EnrollmentFormPayload | null;
  fallbackEmail?: string;
  className?: string;
};

async function fetchDocs(fileToken: string): Promise<DocRow[]> {
  const res = await fetch(
    `/api/enrollment/files/token/${encodeURIComponent(fileToken)}/documents`,
    { credentials: "same-origin" }
  );
  if (!res.ok) throw new Error("documents");
  const json = await res.json();
  return (json.data ?? json) as DocRow[];
}

async function fetchSigs(fileToken: string): Promise<SigRow[]> {
  const res = await fetch(
    `/api/enrollment/signatures?fileToken=${encodeURIComponent(fileToken)}`,
    { credentials: "same-origin" }
  );
  if (!res.ok) throw new Error("signatures");
  const json = await res.json();
  return (json.data ?? json) as SigRow[];
}

export default function EnrollmentFileChecklist({
  fileToken,
  formPayload,
  fallbackEmail,
  className,
}: Props) {
  const form = normalizeFormPayload(
    formPayload ?? createEmptyFormPayload(fallbackEmail),
    fallbackEmail
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "enrollment-checklist",
      fileToken,
      form.children.map((c) => c.localId).join(","),
      form.parents.map((p) => p.email).join(","),
    ],
    queryFn: async () => {
      const [documents, signatures] = await Promise.all([
        fetchDocs(fileToken),
        fetchSigs(fileToken),
      ]);
      return evaluateEnrollmentCompleteness({
        form,
        documents,
        signatures,
      });
    },
    enabled: Boolean(fileToken),
  });

  if (isLoading) {
    return (
      <Card
        className={`flex items-center gap-2 p-3 text-xs text-muted-foreground ${className ?? ""}`}
        variant="primary"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Checklist…
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={`space-y-0.5 p-3 text-xs ${className ?? ""}`} variant="primary">
        <p className="text-sm font-medium text-destructive">Checklist indisponible</p>
        <p className="text-muted-foreground">Documents / signatures inaccessibles.</p>
      </Card>
    );
  }

  const allOk = data.docsOk && data.signaturesOk;

  return (
    <Card className={`space-y-2 p-3 ${className ?? ""}`} variant="primary">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <h2 className="text-sm font-semibold">Checklist</h2>
        <Badge
          variant={allOk ? "success" : "warning"}
          styleVariant="outline"
          className="text-[10px]"
        >
          {allOk ? "Prêt" : "Incomplet"}
        </Badge>
      </div>

      <ul className="space-y-1.5 text-xs">
        <li className="flex items-start gap-1.5">
          {data.docsOk ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm">Documents</p>
            <p className="text-muted-foreground leading-snug">
              {data.missingDocs.length > 0
                ? data.missingDocs.map((d) => d.label).join(" · ")
                : "Tous présents"}
            </p>
          </div>
        </li>
        <li className="flex items-start gap-1.5">
          {data.signaturesOk ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm">Signatures</p>
            <p className="text-muted-foreground leading-snug">
              {data.missingSignatures.length > 0
                ? `${data.missingSignatures.length} manquante(s)`
                : "Toutes signées"}
            </p>
          </div>
        </li>
      </ul>
    </Card>
  );
}
