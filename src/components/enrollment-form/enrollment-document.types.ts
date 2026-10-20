import type { EnrollmentDocumentCategoryKey } from "@/config/enrollment-documents.config";

export type EnrollmentDocRow = {
  id: string;
  accessToken: string;
  category: EnrollmentDocumentCategoryKey;
  scopeRef: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: "PARENT" | "STAFF";
  createdAt: string;
};

export function enrollmentDocUrl(
  accessToken: string,
  fileToken: string,
  options?: { view?: boolean }
): string {
  const params = new URLSearchParams({ fileToken });
  if (options?.view) params.set("view", "1");
  return `/api/enrollment/documents/access/${encodeURIComponent(accessToken)}?${params.toString()}`;
}

export function formatDocSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function isImageMime(mime: string) {
  return mime.startsWith("image/");
}

export function isPdfMime(mime: string) {
  return mime === "application/pdf";
}
