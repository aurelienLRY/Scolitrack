"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Badge } from "@/components/ui";
import { Mail, CheckCircle2, Clock, RefreshCw, Info, BookOpen } from "lucide-react";
import { toast } from "sonner";
import FetchService from "@/lib/services/fetch.service";
import type { EnrollmentSignatureSubjectKey } from "@/config/enrollment-signatures.config";
import { ENROLLMENT_SIGNATURE_SUBJECTS } from "@/config/enrollment-signatures.config";
import {
  getEnrollmentInfoDoc,
  SIGNATURE_INFO_DOC,
} from "@/config/enrollment-info-docs.config";
import EnrollmentInfoModal from "@/components/enrollment-form/EnrollmentInfoModal";

type SignatureRow = {
  id: string;
  email: string;
  subjectKey: string;
  scopeRef?: string | null;
  subjectLabel: string;
  status: "PENDING" | "SIGNED" | "EXPIRED" | "DECLINED";
  confirmedAt?: string | null;
  requestedAt?: string;
};

interface SignatureRequestBlockProps {
  fileToken: string;
  email: string;
  subjectKey: EnrollmentSignatureSubjectKey;
  scopeRef?: string;
  childName?: string;
  readOnly?: boolean;
  showReminder?: boolean;
  /** Si fourni, évite un fetch par bloc (lot parent) */
  externalRows?: SignatureRow[];
}

export default function SignatureRequestBlock({
  fileToken,
  email,
  subjectKey,
  scopeRef = "",
  childName,
  readOnly,
  showReminder = true,
  externalRows,
}: SignatureRequestBlockProps) {
  const subject = ENROLLMENT_SIGNATURE_SUBJECTS[subjectKey];
  const infoDocId = SIGNATURE_INFO_DOC[subjectKey];
  const infoDoc = infoDocId ? getEnrollmentInfoDoc(infoDocId) : null;

  const displayLabel = childName?.trim()
    ? `${subject.label} — ${childName.trim()}`
    : subject.label;

  const [rows, setRows] = useState<SignatureRow[]>(externalRows ?? []);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [hasRead, setHasRead] = useState(false);

  const normalizedScope = scopeRef.trim();

  const refresh = useCallback(async () => {
    if (!fileToken || externalRows) return;
    setLoading(true);
    try {
      const res = await FetchService.get<SignatureRow[]>(
        `/api/enrollment/signatures?fileToken=${encodeURIComponent(fileToken)}`
      );
      setRows(res.data ?? []);
    } catch {
      // silencieux au premier chargement
    } finally {
      setLoading(false);
    }
  }, [fileToken, externalRows]);

  useEffect(() => {
    if (externalRows) {
      setRows(externalRows);
      return;
    }
    void refresh();
  }, [refresh, externalRows]);

  const forEmail = rows.filter(
    (r) =>
      r.subjectKey === subjectKey &&
      (r.scopeRef ?? "").trim() === normalizedScope &&
      r.email.trim().toLowerCase() === email.trim().toLowerCase()
  );
  const signed = forEmail.find((r) => r.status === "SIGNED");
  const pending = forEmail.find((r) => r.status === "PENDING");

  const canSend =
    Boolean(email?.includes("@")) &&
    (!infoDoc || hasRead) &&
    !signed;

  const request = async () => {
    if (!email?.includes("@")) {
      toast.error("Renseignez d'abord un email valide pour ce responsable");
      return;
    }
    if (infoDoc && !hasRead) {
      toast.error("Lisez d'abord les informations avant d'envoyer la signature");
      setInfoOpen(true);
      return;
    }
    setSending(true);
    try {
      await FetchService.post("/api/enrollment/signatures", {
        fileToken,
        email,
        subjectKey,
        scopeRef: normalizedScope,
        childName: childName?.trim() || undefined,
      });
      toast.success(`Email de signature envoyé à ${email}`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi impossible");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-teal-700/20 bg-teal-50/40 p-4 dark:bg-teal-950/20">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-teal-800/70 dark:text-teal-200/70">
            Signature
          </p>
          <h4 className="text-sm font-semibold">{displayLabel}</h4>
        </div>
        {signed ? (
          <Badge variant="success" styleVariant="outline">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Signé
          </Badge>
        ) : forEmail.find((r) => r.status === "DECLINED") ? (
          <Badge variant="secondary" styleVariant="outline">
            Refusé
          </Badge>
        ) : pending ? (
          <Badge variant="warning" styleVariant="outline">
            <Clock className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        ) : hasRead && infoDoc ? (
          <Badge variant="info" styleVariant="outline">
            Lu
          </Badge>
        ) : null}
      </div>

      {showReminder && subject.formReminder ? (
        <p className="text-sm leading-relaxed text-foreground/90">
          {subject.formReminder}
        </p>
      ) : null}

      {signed?.confirmedAt ? (
        <p className="text-xs text-muted-foreground">
          Signé le {new Date(signed.confirmedAt).toLocaleString("fr-FR")}
        </p>
      ) : null}

      {!readOnly && !signed && (
        <div className="flex flex-wrap gap-2">
          {infoDoc ? (
            <Button
              type="button"
              size="sm"
              variant="soft"
              color="secondary"
              className="border border-white/60 bg-white text-slate-800 shadow-sm hover:bg-white/90 dark:bg-white dark:text-slate-900"
              onClick={() => setInfoOpen(true)}
            >
              {hasRead ? (
                <Info className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              )}
              {hasRead ? "Relire les infos" : "Lire les infos"}
            </Button>
          ) : null}

          <Button
            type="button"
            size="sm"
            variant="outline"
            color="secondary"
            className="border-white/40 bg-white text-slate-900 hover:bg-white/90 disabled:opacity-40 dark:bg-white dark:text-slate-900"
            onClick={request}
            disabled={sending || loading || !canSend}
            tooltip={
              !email?.includes("@")
                ? "Email du responsable requis"
                : infoDoc && !hasRead
                  ? "Lisez d'abord les informations"
                  : undefined
            }
          >
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            {pending ? "Renvoyer l'email" : "Envoyer pour signer"}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="bg-white/10 text-foreground hover:bg-white/20"
            onClick={() => void refresh()}
            disabled={loading}
            tooltip="Actualiser"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {!readOnly && !signed && infoDoc && !hasRead ? (
        <p className="text-xs text-amber-800 dark:text-amber-300">
          Lisez les informations pour activer l&apos;envoi de signature.
        </p>
      ) : null}

      {infoDoc ? (
        <EnrollmentInfoModal
          doc={infoDoc}
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          requireAck={!hasRead}
          onAcknowledge={() => setHasRead(true)}
        />
      ) : null}
    </div>
  );
}
