"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import FetchService from "@/lib/services/fetch.service";
import SignatureRequestBlock from "@/components/enrollment-form/SignatureRequestBlock";
import {
  CHILD_SIGNATURE_ORDER,
  GUARDIAN_SIGNATURE_ORDER,
} from "@/config/enrollment-signatures.config";
import type { EnrollmentChildForm } from "@/types/enrollment-form.type";

type SignatureRow = {
  id: string;
  email: string;
  subjectKey: string;
  scopeRef?: string | null;
  status: string;
};

interface GuardianSignaturesPanelProps {
  fileToken: string;
  email: string;
  readOnly?: boolean;
  guardianLabel: string;
  /** Enfants du dossier — inclus dans le même email de signatures */
  childList?: EnrollmentChildForm[];
}

export default function GuardianSignaturesPanel({
  fileToken,
  email,
  readOnly,
  guardianLabel,
  childList = [],
}: GuardianSignaturesPanelProps) {
  const [rows, setRows] = useState<SignatureRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    if (!fileToken) return;
    setLoading(true);
    try {
      const res = await FetchService.get<SignatureRow[]>(
        `/api/enrollment/signatures?fileToken=${encodeURIComponent(fileToken)}`
      );
      setRows(res.data ?? []);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, [fileToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const batchItems = useMemo(() => {
    const items: Array<{
      subjectKey: (typeof GUARDIAN_SIGNATURE_ORDER)[number];
      scopeRef: string;
      childName?: string;
    }> = GUARDIAN_SIGNATURE_ORDER.map((subjectKey) => ({
      subjectKey,
      scopeRef: "",
    }));

    for (const child of childList) {
      const childName =
        `${child.firstName} ${child.lastName}`.trim() || "enfant";
      for (const subjectKey of CHILD_SIGNATURE_ORDER) {
        items.push({
          subjectKey,
          scopeRef: child.localId,
          childName,
        });
      }
    }
    return items;
  }, [childList]);

  const emailNorm = email.trim().toLowerCase();
  const progress = useMemo(() => {
    let signed = 0;
    for (const item of batchItems) {
      const match = rows.find(
        (r) =>
          r.email.trim().toLowerCase() === emailNorm &&
          r.subjectKey === item.subjectKey &&
          (r.scopeRef ?? "").trim() === item.scopeRef &&
          r.status === "SIGNED"
      );
      if (match) signed += 1;
    }
    return { signed, total: batchItems.length };
  }, [batchItems, rows, emailNorm]);

  const sendBatch = async () => {
    if (!email?.includes("@")) {
      toast.error("Renseignez d'abord un email valide");
      return;
    }
    if (batchItems.length === 0) {
      toast.error("Aucune clause à signer");
      return;
    }
    setSending(true);
    try {
      await FetchService.post("/api/enrollment/signatures/batch", {
        fileToken,
        email,
        items: batchItems,
      });
      toast.success(`Email envoyé à ${email} — un seul lien pour tout signer`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi impossible");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
        <h4 className="font-semibold">Signatures — {guardianLabel}</h4>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
          <li>
            Cliquez sur{" "}
            <strong className="text-foreground">
              Envoyer le lien de signatures
            </strong>
            {email?.includes("@") ? (
              <>
                {" "}
                — un seul mail part à{" "}
                <strong className="text-foreground">{email}</strong>
              </>
            ) : null}
            .
          </li>
          <li>
            Sur la page reçue : lisez chaque clause, choisissez oui ou non, puis
            validez une fois en bas.
          </li>
        </ol>
        <p className="mt-2 text-xs text-muted-foreground">
          Inclut les engagements du responsable
          {childList.length > 0
            ? ` et les autorisations pour ${childList.length} enfant(s)`
            : ""}
          .
        </p>
        {progress.total > 0 ? (
          <p className="mt-2 text-sm font-medium">
            Avancement : {progress.signed} / {progress.total} signées
          </p>
        ) : null}
        {!email?.includes("@") ? (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            Indiquez d&apos;abord votre email dans l&apos;onglet Formulaire.
          </p>
        ) : null}

        {!readOnly ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              color="secondary"
              className="border-white/40 bg-white text-slate-900 hover:bg-white/90 dark:bg-white dark:text-slate-900"
              onClick={() => void sendBatch()}
              disabled={sending || loading || !email?.includes("@")}
            >
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              {sending
                ? "Envoi…"
                : "Envoyer le lien de signatures"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => void refresh()}
              disabled={loading}
              tooltip="Actualiser le statut"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : null}
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Détail des clauses (statut)
      </p>

      {GUARDIAN_SIGNATURE_ORDER.map((key) => (
        <SignatureRequestBlock
          key={key}
          fileToken={fileToken}
          email={email}
          subjectKey={key}
          scopeRef=""
          readOnly
          showReminder
          externalRows={rows}
        />
      ))}

      {childList.map((child) => {
        const name =
          `${child.firstName} ${child.lastName}`.trim() || "Enfant";
        return (
          <div key={child.localId} className="space-y-3">
            <p className="text-sm font-medium">Autorisations — {name}</p>
            {CHILD_SIGNATURE_ORDER.map((key) => (
              <SignatureRequestBlock
                key={`${child.localId}-${key}`}
                fileToken={fileToken}
                email={email}
                subjectKey={key}
                scopeRef={child.localId}
                childName={name}
                readOnly
                showReminder
                externalRows={rows}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
