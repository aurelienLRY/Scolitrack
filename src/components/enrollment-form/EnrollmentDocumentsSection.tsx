"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Badge } from "@/components/ui";
import { Eye, FileUp, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import FetchService from "@/lib/services/fetch.service";
import {
  ENROLLMENT_DOCUMENT_CATEGORIES,
  ENROLLMENT_DOC_ACCEPT_ATTR,
  ENROLLMENT_DOC_MAX_BYTES,
  type EnrollmentDocumentCategoryKey,
} from "@/config/enrollment-documents.config";
import type { EnrollmentChildForm } from "@/types/enrollment-form.type";
import EnrollmentDocumentViewer from "@/components/enrollment-form/EnrollmentDocumentViewer";
import {
  formatDocSize,
  type EnrollmentDocRow,
} from "@/components/enrollment-form/enrollment-document.types";

interface EnrollmentDocumentsSectionProps {
  fileToken: string;
  readOnly?: boolean;
  childList: EnrollmentChildForm[];
}

function categoryLabel(key: string) {
  return (
    ENROLLMENT_DOCUMENT_CATEGORIES.find((c) => c.key === key)?.label ?? key
  );
}

export default function EnrollmentDocumentsSection({
  fileToken,
  readOnly,
  childList,
}: EnrollmentDocumentsSectionProps) {
  const [docs, setDocs] = useState<EnrollmentDocRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] =
    useState<EnrollmentDocumentCategoryKey>("FAMILY_BOOK");
  const [scopeRef, setScopeRef] = useState("");
  const [viewerDoc, setViewerDoc] = useState<EnrollmentDocRow | null>(null);

  const selectedMeta = useMemo(
    () => ENROLLMENT_DOCUMENT_CATEGORIES.find((c) => c.key === category),
    [category]
  );

  const refresh = useCallback(async () => {
    if (!fileToken) return;
    setLoading(true);
    try {
      const res = await FetchService.get<EnrollmentDocRow[]>(
        `/api/enrollment/files/token/${encodeURIComponent(fileToken)}/documents`
      );
      setDocs(res.data ?? []);
    } catch {
      // silencieux au premier chargement
    } finally {
      setLoading(false);
    }
  }, [fileToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selectedMeta?.perChild) {
      setScopeRef("");
    } else if (
      childList.length > 0 &&
      !childList.some((c) => c.localId === scopeRef)
    ) {
      setScopeRef(childList[0].localId);
    }
  }, [selectedMeta?.perChild, childList, scopeRef]);

  const onUpload = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    if (file.size > ENROLLMENT_DOC_MAX_BYTES) {
      toast.error("Fichier trop volumineux (max 10 Mo)");
      return;
    }

    if (selectedMeta?.perChild && !scopeRef) {
      toast.error("Choisissez l'enfant concerné");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    if (scopeRef) formData.append("scopeRef", scopeRef);

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

  const onDelete = async (doc: EnrollmentDocRow) => {
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

  const childName = (localId: string) => {
    const c = childList.find((x) => x.localId === localId);
    if (!c) return localId;
    const n = `${c.firstName} ${c.lastName}`.trim();
    return n || "Enfant";
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-2 p-4" variant="primary">
        <h3 className="font-semibold">Documents du dossier</h3>
        <p className="text-sm text-muted-foreground">
          Vue d&apos;ensemble. Obligatoires pour soumettre : livret de famille,
          vaccination et assurance scolaire (par enfant). PDF, JPEG, PNG, WEBP
          — 10&nbsp;Mo max.
        </p>
      </Card>

      {!readOnly && (
        <Card className="space-y-4 p-4" variant="primary">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Type de document
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as EnrollmentDocumentCategoryKey)
                }
              >
                {ENROLLMENT_DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                    {c.required ? " *" : ""}
                    {c.perChild ? " (par enfant)" : ""}
                  </option>
                ))}
              </select>
              {selectedMeta ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedMeta.hint}
                </p>
              ) : null}
            </div>

            {selectedMeta?.perChild ? (
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Enfant concerné
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={scopeRef}
                  onChange={(e) => setScopeRef(e.target.value)}
                  disabled={childList.length === 0}
                >
                  {childList.length === 0 ? (
                    <option value="">Ajoutez d&apos;abord un enfant</option>
                  ) : (
                    childList.map((c, i) => (
                      <option key={c.localId} value={c.localId}>
                        {`${c.firstName} ${c.lastName}`.trim() ||
                          `Enfant ${i + 1}`}
                      </option>
                    ))
                  )}
                </select>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept={ENROLLMENT_DOC_ACCEPT_ATTR}
                disabled={uploading}
                onChange={(e) => {
                  void onUpload(e.target.files);
                  e.target.value = "";
                }}
              />
              <span className="inline-flex h-9 items-center gap-2 rounded-md border border-white/50 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-white/90 dark:bg-white dark:text-slate-900">
                <FileUp className="h-4 w-4" />
                {uploading ? "Envoi…" : "Choisir un fichier"}
              </span>
            </label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => void refresh()}
              disabled={loading}
              tooltip="Actualiser la liste"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      <Card className="space-y-3 p-4" variant="primary">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold">Pièces déposées</h4>
          <span className="text-xs text-muted-foreground">
            {docs.length} document{docs.length > 1 ? "s" : ""}
          </span>
        </div>

        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun document pour le moment.
          </p>
        ) : (
          <ul className="space-y-2">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/15 px-3 py-2"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium">
                    {doc.originalName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="info" styleVariant="outline">
                      {categoryLabel(doc.category)}
                    </Badge>
                    {doc.scopeRef ? (
                      <span>{childName(doc.scopeRef)}</span>
                    ) : null}
                    <span>{formatDocSize(doc.sizeBytes)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
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
                      onClick={() => void onDelete(doc)}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <EnrollmentDocumentViewer
        doc={viewerDoc}
        fileToken={fileToken}
        open={Boolean(viewerDoc)}
        onClose={() => setViewerDoc(null)}
      />
    </div>
  );
}
