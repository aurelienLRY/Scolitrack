"use client";

import { useEffect, useState } from "react";
import Modal, { ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import {
  enrollmentDocUrl,
  isImageMime,
  isPdfMime,
  type EnrollmentDocRow,
} from "@/components/enrollment-form/enrollment-document.types";

interface EnrollmentDocumentViewerProps {
  doc: EnrollmentDocRow | null;
  fileToken: string;
  open: boolean;
  onClose: () => void;
}

export default function EnrollmentDocumentViewer({
  doc,
  fileToken,
  open,
  onClose,
}: EnrollmentDocumentViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !doc) {
      setBlobUrl(null);
      setLoadError(null);
      return;
    }

    let revoked = false;
    let objectUrl: string | null = null;
    const url = enrollmentDocUrl(doc.accessToken, fileToken, { view: true });

    setLoading(true);
    setLoadError(null);
    setBlobUrl(null);

    void (async () => {
      try {
        const res = await fetch(url, { credentials: "same-origin" });
        if (!res.ok) {
          throw new Error("Impossible de charger le document");
        }
        const blob = await res.blob();
        if (revoked) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (e) {
        if (!revoked) {
          setLoadError(
            e instanceof Error ? e.message : "Erreur de chargement"
          );
        }
      } finally {
        if (!revoked) setLoading(false);
      }
    })();

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, doc, fileToken]);

  if (!doc) return null;

  const downloadUrl = enrollmentDocUrl(doc.accessToken, fileToken);
  const viewUrl = enrollmentDocUrl(doc.accessToken, fileToken, { view: true });
  const image = isImageMime(doc.mimeType);
  const pdf = isPdfMime(doc.mimeType);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={doc.originalName}
      description="Aperçu du document"
      size="full"
      className="flex h-[90vh] max-h-[90vh] w-[min(96vw,1200px)] flex-col"
      contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-3 !max-h-none sm:p-4"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border/50 bg-slate-950/5 dark:bg-black/40">
        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Chargement…
          </div>
        ) : loadError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
            <p>{loadError}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              color="secondary"
              className="bg-white text-slate-900 dark:bg-white dark:text-slate-900"
              onClick={() => window.open(viewUrl, "_blank")}
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Ouvrir dans un nouvel onglet
            </Button>
          </div>
        ) : image && blobUrl ? (
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blobUrl}
              alt={doc.originalName}
              className="max-h-full w-auto max-w-full object-contain"
            />
          </div>
        ) : pdf && blobUrl ? (
          <iframe
            title={doc.originalName}
            src={`${blobUrl}#toolbar=1&navpanes=0`}
            className="min-h-0 w-full flex-1 border-0 bg-white"
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
            <p>Aperçu non disponible pour ce type de fichier.</p>
            <p className="text-xs">
              Formats prévisualisables : PDF, JPEG, PNG, WEBP.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              color="secondary"
              className="bg-white text-slate-900 dark:bg-white dark:text-slate-900"
              onClick={() => window.open(viewUrl, "_blank")}
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Ouvrir dans un nouvel onglet
            </Button>
          </div>
        )}
      </div>

      <ModalFooter className="shrink-0 border-t-0 pt-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          color="secondary"
          className="bg-white text-slate-900 dark:bg-white dark:text-slate-900"
          onClick={() => window.open(downloadUrl, "_blank")}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Télécharger
        </Button>
        <Button
          type="button"
          size="sm"
          variant="soft"
          color="secondary"
          className="bg-white text-slate-900 dark:bg-white dark:text-slate-900"
          onClick={onClose}
        >
          Fermer
        </Button>
      </ModalFooter>
    </Modal>
  );
}
