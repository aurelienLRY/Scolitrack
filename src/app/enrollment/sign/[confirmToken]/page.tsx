"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Badge } from "@/components/ui";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { toast } from "sonner";
import FetchService from "@/lib/services/fetch.service";

type SignatureView = {
  id: string;
  status: "PENDING" | "SIGNED" | "EXPIRED";
  subjectKey: string;
  subjectLabel: string;
  acceptanceText: string;
  email: string;
  confirmedAt?: string | null;
  linkExpiresAt?: string | null;
  campaign?: { id: string; name: string };
};

export default function EnrollmentSignPage() {
  const params = useParams();
  const raw = params.confirmToken;
  const confirmToken =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? "" : "";

  const [signature, setSignature] = useState<SignatureView | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmToken) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await FetchService.get<SignatureView>(
          `/api/enrollment/signatures/confirm/${confirmToken}`
        );
        if (!cancelled) setSignature(res.data ?? null);
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
  }, [confirmToken]);

  const confirm = async () => {
    if (!accepted) {
      toast.error("Cochez la case d'acceptation");
      return;
    }
    setSubmitting(true);
    try {
      const res = await FetchService.post<SignatureView>(
        `/api/enrollment/signatures/confirm/${confirmToken}`,
        { accepted: true }
      );
      setSignature(res.data ?? null);
      toast.success("Signature enregistrée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de validation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto max-w-lg py-10">Chargement…</div>;
  }

  if (error || !signature) {
    return (
      <div className="container mx-auto max-w-lg py-10">
        <Card className="space-y-2 p-6" variant="primary">
          <h1 className="text-xl font-bold">Lien invalide</h1>
          <p className="text-muted-foreground">
            {error ?? "Cette demande de signature est introuvable."}
          </p>
        </Card>
      </div>
    );
  }

  const alreadySigned = signature.status === "SIGNED";
  const expired = signature.status === "EXPIRED";

  return (
    <div className="container mx-auto max-w-lg space-y-4 py-10">
      <Card className="space-y-4 p-6" variant="primary">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Signature électronique
            </p>
            <h1 className="mt-1 text-xl font-bold">{signature.subjectLabel}</h1>
            {signature.campaign?.name ? (
              <p className="text-sm text-muted-foreground">
                Campagne : {signature.campaign.name}
              </p>
            ) : null}
          </div>
          <Badge
            variant={
              alreadySigned ? "success" : expired ? "destructive" : "warning"
            }
            styleVariant="outline"
          >
            {alreadySigned
              ? "Signé"
              : expired
                ? "Expiré"
                : "En attente"}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Destinataire : <span className="text-foreground">{signature.email}</span>
        </p>

        <div className="rounded-md bg-muted/40 p-4 text-sm leading-relaxed">
          {signature.acceptanceText}
        </div>

        {alreadySigned ? (
          <p className="text-sm text-success">
            Signé le{" "}
            {signature.confirmedAt
              ? new Date(signature.confirmedAt).toLocaleString("fr-FR")
              : "—"}
            . Vous pouvez fermer cette page.
          </p>
        ) : expired ? (
          <p className="text-sm text-destructive">
            Ce lien a expiré. Retournez au dossier d&apos;inscription et
            redemandez un email de signature.
          </p>
        ) : (
          <div className="space-y-4">
            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
              />
              <span>
                J&apos;accepte le texte ci-dessus et confirme ma signature
                électronique pour <strong>{signature.subjectLabel}</strong>.
              </span>
            </label>
            <Button
              type="button"
              onClick={confirm}
              disabled={submitting || !accepted}
            >
              Valider ma signature
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
