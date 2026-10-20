"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Badge } from "@/components/ui";
import { toast } from "sonner";
import FetchService from "@/lib/services/fetch.service";
import {
  getEnrollmentInfoDoc,
  SIGNATURE_INFO_DOC,
} from "@/config/enrollment-info-docs.config";
import type { EnrollmentSignatureSubjectKey } from "@/config/enrollment-signatures.config";
import EnrollmentInfoModal from "@/components/enrollment-form/EnrollmentInfoModal";
import { BookOpen, CheckCircle2 } from "lucide-react";

type BatchItem = {
  id: string;
  subjectKey: string;
  subjectLabel: string;
  acceptanceText: string;
  scopeRef: string;
  status: "PENDING" | "SIGNED" | "EXPIRED" | "DECLINED";
  confirmedAt?: string | null;
  optional: boolean;
};

type BatchView = {
  batchToken: string;
  email: string;
  campaign?: { id: string; name: string } | null;
  items: BatchItem[];
};

type Decision = "yes" | "no" | null;

export default function EnrollmentSignBatchPage() {
  const params = useParams();
  const raw = params.batchToken;
  const batchToken =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? "" : "";

  const [batch, setBatch] = useState<BatchView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [readIds, setReadIds] = useState<Record<string, boolean>>({});
  const [infoItemId, setInfoItemId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!batchToken) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await FetchService.get<BatchView>(
          `/api/enrollment/signatures/batch/${encodeURIComponent(batchToken)}`
        );
        if (cancelled) return;
        const data = res.data ?? null;
        setBatch(data);
        if (data) {
          const init: Record<string, Decision> = {};
          const reads: Record<string, boolean> = {};
          for (const item of data.items) {
            if (item.status === "SIGNED") init[item.id] = "yes";
            else if (item.status === "DECLINED") init[item.id] = "no";
            else init[item.id] = null;
            reads[item.id] =
              item.status === "SIGNED" || item.status === "DECLINED";
          }
          setDecisions(init);
          setReadIds(reads);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Lien invalide");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [batchToken]);

  const allDone = useMemo(
    () =>
      batch?.items.every(
        (i) => i.status === "SIGNED" || i.status === "DECLINED"
      ) ?? false,
    [batch]
  );

  const expired = useMemo(
    () => batch?.items.some((i) => i.status === "EXPIRED") ?? false,
    [batch]
  );

  const infoItem = batch?.items.find((i) => i.id === infoItemId) ?? null;
  const infoDocId = infoItem
    ? SIGNATURE_INFO_DOC[
        infoItem.subjectKey as EnrollmentSignatureSubjectKey
      ]
    : undefined;
  const infoDoc = infoDocId ? getEnrollmentInfoDoc(infoDocId) : null;

  const canSubmit = useMemo(() => {
    if (!batch || allDone || expired) return false;
    return batch.items.every((item) => {
      if (item.status === "SIGNED" || item.status === "DECLINED") return true;
      const infoId =
        SIGNATURE_INFO_DOC[item.subjectKey as EnrollmentSignatureSubjectKey];
      if (infoId && !readIds[item.id]) return false;
      if (item.optional) {
        return decisions[item.id] === "yes" || decisions[item.id] === "no";
      }
      return decisions[item.id] === "yes";
    });
  }, [batch, decisions, readIds, allDone, expired]);

  const submit = async () => {
    if (!batch || !canSubmit) return;
    setSubmitting(true);
    try {
      const res = await FetchService.post<BatchView>(
        `/api/enrollment/signatures/batch/${encodeURIComponent(batchToken)}`,
        {
          decisions: batch.items.map((item) => ({
            id: item.id,
            accepted: decisions[item.id] === "yes",
          })),
        }
      );
      setBatch(res.data ?? batch);
      toast.success("Signatures enregistrées — merci");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de validation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl py-10">Chargement…</div>
    );
  }

  if (error || !batch) {
    return (
      <div className="container mx-auto max-w-2xl py-10">
        <Card className="space-y-2 p-6" variant="primary">
          <h1 className="text-xl font-bold">Lien invalide</h1>
          <p className="text-muted-foreground">
            {error ?? "Cette demande de signatures est introuvable."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-4 py-8">
      <Card className="space-y-3 p-6" variant="primary">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Signatures groupées
            </p>
            <h1 className="mt-1 text-xl font-bold">
              {batch.campaign?.name ?? "Dossier d'inscription"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Destinataire :{" "}
              <span className="text-foreground">{batch.email}</span>
            </p>
          </div>
          <Badge
            variant={allDone ? "success" : expired ? "destructive" : "warning"}
            styleVariant="outline"
          >
            {allDone ? "Terminé" : expired ? "Expiré" : "À compléter"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Lisez chaque clause, choisissez oui ou non, puis validez une seule
          fois en bas de page.
        </p>
      </Card>

      {batch.items.map((item, index) => {
        const needsInfo = Boolean(
          SIGNATURE_INFO_DOC[item.subjectKey as EnrollmentSignatureSubjectKey]
        );
        const locked =
          item.status === "SIGNED" ||
          item.status === "DECLINED" ||
          item.status === "EXPIRED";
        const decision = decisions[item.id];

        return (
          <Card key={item.id} className="space-y-3 p-5" variant="primary">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[11px] text-muted-foreground">
                  {index + 1} / {batch.items.length}
                  {item.optional ? " · optionnel" : " · obligatoire"}
                </p>
                <h2 className="text-base font-semibold">{item.subjectLabel}</h2>
              </div>
              {item.status === "SIGNED" ? (
                <Badge variant="success" styleVariant="outline">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Oui
                </Badge>
              ) : item.status === "DECLINED" ? (
                <Badge variant="secondary" styleVariant="outline">
                  Non
                </Badge>
              ) : null}
            </div>

            <div className="rounded-md bg-muted/40 p-3 text-sm leading-relaxed">
              {item.acceptanceText}
            </div>

            {!locked && needsInfo ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                color="secondary"
                onClick={() => setInfoItemId(item.id)}
              >
                <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                {readIds[item.id] ? "Relire les infos" : "Lire les infos"}
              </Button>
            ) : null}

            {!locked ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={decision === "yes" ? "solid" : "outline"}
                  color="secondary"
                  disabled={needsInfo && !readIds[item.id]}
                  onClick={() =>
                    setDecisions((prev) => ({ ...prev, [item.id]: "yes" }))
                  }
                >
                  Oui, j&apos;accepte
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={decision === "no" ? "solid" : "outline"}
                  color={item.optional ? "secondary" : "destructive"}
                  disabled={needsInfo && !readIds[item.id]}
                  onClick={() =>
                    setDecisions((prev) => ({ ...prev, [item.id]: "no" }))
                  }
                  tooltip={
                    !item.optional
                      ? "Cette clause est obligatoire pour finaliser"
                      : undefined
                  }
                >
                  Non
                </Button>
              </div>
            ) : null}

            {!locked && needsInfo && !readIds[item.id] ? (
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Lisez les informations pour activer oui / non.
              </p>
            ) : null}
          </Card>
        );
      })}

      {!allDone && !expired ? (
        <div className="sticky bottom-4 rounded-md border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur">
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => void submit()}
            disabled={submitting || !canSubmit}
          >
            {submitting ? "Enregistrement…" : "Valider toutes les réponses"}
          </Button>
          {!canSubmit ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Répondez à chaque clause (et lisez les infos si demandé) avant de
              valider.
            </p>
          ) : null}
        </div>
      ) : allDone ? (
        <Card className="p-4 text-sm text-success" variant="primary">
          Tout est enregistré. Vous pouvez fermer cette page.
        </Card>
      ) : (
        <Card className="p-4 text-sm text-destructive" variant="primary">
          Ce lien a expiré. Retournez au dossier et redemandez un email.
        </Card>
      )}

      {infoDoc && infoItem ? (
        <EnrollmentInfoModal
          doc={infoDoc}
          open={Boolean(infoItemId)}
          onClose={() => setInfoItemId(null)}
          requireAck={!readIds[infoItem.id]}
          onAcknowledge={() =>
            setReadIds((prev) => ({ ...prev, [infoItem.id]: true }))
          }
        />
      ) : null}
    </div>
  );
}
