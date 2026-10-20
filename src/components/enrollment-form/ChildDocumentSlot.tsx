"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Badge } from "@/components/ui";
import { Eye, FileUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import FetchService from "@/lib/services/fetch.service";
import {
  ENROLLMENT_DOC_ACCEPT_ATTR,
  ENROLLMENT_DOC_MAX_BYTES,
  getDocumentCategoryMeta,
  type EnrollmentDocumentCategoryKey,
} from "@/config/enrollment-documents.config";
import EnrollmentDocumentViewer from "@/components/enrollment-form/EnrollmentDocumentViewer";
import {
  formatDocSize,
  type EnrollmentDocRow,
} from "@/components/enrollment-form/enrollment-document.types";

interface ChildDocumentSlotProps {
  fileToken: string;
  childLocalId: string;
  category: EnrollmentDocumentCategoryKey;
  readOnly?: boolean;
  /** Libellé du bouton (sinon « Joindre … ») */
  buttonLabel?: string;
  compact?: boolean;
}

export default function ChildDocumentSlot({
  fileToken,
  childLocalId,
  category,
  readOnly,
  buttonLabel,
  compact = false,
}: ChildDocumentSlotProps) {
  const meta = getDocumentCategoryMeta(category);
  const [docs, setDocs] = useState<EnrollmentDocRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<EnrollmentDocRow | null>(null);

  const refresh = useCallback(async () => {
    if (!fileToken) return;
    try {
      const res = await FetchService.get<EnrollmentDocRow[]>(
        `/api/enrollment/files/token/${encodeURIComponent(fileToken)}/documents`
      );
      setDocs(
        (res.data ?? []).filter(
          (d) => d.scopeRef === childLocalId && d.category === category
        )
      );
    } catch {
      // silencieux
    }
  }, [fileToken, childLocalId, category]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upload = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    if (file.size > ENROLLMENT_DOC_MAX_BYTES) {
      toast.error("Fichier trop volumineux (max 10 Mo)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("scopeRef", childLocalId);

    setUploading(true);
    try {
      await FetchService.postFormData(
        `/api/enrollment/files/token/${encodeURIComponent(fileToken)}/documents`,
        formData
      );
      toast.success("Document déposé");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Dépôt impossible");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (doc: EnrollmentDocRow) => {
    try {
      await FetchService.delete(
        `/api/enrollment/documents/access/${encodeURIComponent(doc.accessToken)}?fileToken=${encodeURIComponent(fileToken)}`
      );
      toast.success("Document supprimé");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible");
    }
  };

  const label =
    buttonLabel ??
    (meta ? `Joindre — ${meta.label}` : "Joindre un document");

  return (
    <div
      className={
        compact
          ? "space-y-2"
          : "space-y-2 rounded-md border border-border/40 bg-background/40 p-3"
      }
    >
      {!readOnly && (
        <label className="inline-flex cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept={ENROLLMENT_DOC_ACCEPT_ATTR}
            disabled={uploading}
            onChange={(e) => {
              void upload(e.target.files);
              e.target.value = "";
            }}
          />
          <span className="inline-flex h-9 items-center gap-2 rounded-md border border-white/50 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-white/90 dark:bg-white dark:text-slate-900">
            <FileUp className="h-4 w-4" />
            {uploading ? "Envoi…" : label}
          </span>
        </label>
      )}

      {docs.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Aucun fichier déposé.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/40 bg-muted/15 px-2.5 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {doc.originalName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDocSize(doc.sizeBytes)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="info" styleVariant="outline">
                  {doc.mimeType.includes("pdf") ? "PDF" : "Image"}
                </Badge>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  tooltip="Visualiser"
                  onClick={() => setViewerDoc(doc)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {!readOnly && (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    color="destructive"
                    icon={Trash2}
                    iconOnly
                    tooltip="Supprimer"
                    onClick={() => void remove(doc)}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <EnrollmentDocumentViewer
        doc={viewerDoc}
        fileToken={fileToken}
        open={Boolean(viewerDoc)}
        onClose={() => setViewerDoc(null)}
      />
    </div>
  );
}
