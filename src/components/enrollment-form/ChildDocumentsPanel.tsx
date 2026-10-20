"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Badge } from "@/components/ui";
import { Eye, FileUp, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import FetchService from "@/lib/services/fetch.service";
import {
  CHILD_DOCUMENT_CATEGORIES,
  ENROLLMENT_DOC_ACCEPT_ATTR,
  ENROLLMENT_DOC_MAX_BYTES,
  type EnrollmentDocumentCategoryKey,
} from "@/config/enrollment-documents.config";
import EnrollmentDocumentViewer from "@/components/enrollment-form/EnrollmentDocumentViewer";
import {
  formatDocSize,
  type EnrollmentDocRow,
} from "@/components/enrollment-form/enrollment-document.types";

interface ChildDocumentsPanelProps {
  fileToken: string;
  childLocalId: string;
  childName: string;
  readOnly?: boolean;
}

export default function ChildDocumentsPanel({
  fileToken,
  childLocalId,
  childName,
  readOnly,
}: ChildDocumentsPanelProps) {
  const [docs, setDocs] = useState<EnrollmentDocRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [viewerDoc, setViewerDoc] = useState<EnrollmentDocRow | null>(null);

  const refresh = useCallback(async () => {
    if (!fileToken) return;
    setLoading(true);
    try {
      const res = await FetchService.get<EnrollmentDocRow[]>(
        `/api/enrollment/files/token/${encodeURIComponent(fileToken)}/documents`
      );
      setDocs(
        (res.data ?? []).filter((d) => d.scopeRef === childLocalId)
      );
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, [fileToken, childLocalId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const docsFor = (category: EnrollmentDocumentCategoryKey) =>
    docs.filter((d) => d.category === category);

  const upload = async (
    category: EnrollmentDocumentCategoryKey,
    fileList: FileList | null
  ) => {
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

    setUploadingKey(category);
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
      setUploadingKey(null);
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

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-muted/15 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold">Documents — {childName}</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Vaccins, assurance scolaire, aptitude… Déposez, visualisez ou
              retirez les pièces de cet enfant. Facultatif pour l&apos;instant.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => void refresh()}
            disabled={loading}
            tooltip="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {CHILD_DOCUMENT_CATEGORIES.map((cat) => {
        const list = docsFor(cat.key);
        return (
          <section
            key={cat.key}
            className="space-y-2 rounded-lg border border-border/60 bg-muted/10 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h5 className="text-sm font-semibold">{cat.label}</h5>
                <p className="text-xs text-muted-foreground">{cat.hint}</p>
              </div>
              {!readOnly && (
                <label className="inline-flex cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept={ENROLLMENT_DOC_ACCEPT_ATTR}
                    disabled={uploadingKey === cat.key}
                    onChange={(e) => {
                      void upload(cat.key, e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/50 bg-white px-2.5 text-xs font-medium text-slate-900 shadow-sm dark:bg-white dark:text-slate-900">
                    <FileUp className="h-3.5 w-3.5" />
                    {uploadingKey === cat.key ? "Envoi…" : "Ajouter"}
                  </span>
                </label>
              )}
            </div>

            {list.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucun fichier.</p>
            ) : (
              <ul className="space-y-1.5">
                {list.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/40 bg-background/50 px-2.5 py-2"
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
          </section>
        );
      })}

      <EnrollmentDocumentViewer
        doc={viewerDoc}
        fileToken={fileToken}
        open={Boolean(viewerDoc)}
        onClose={() => setViewerDoc(null)}
      />
    </div>
  );
}
