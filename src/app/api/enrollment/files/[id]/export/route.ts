import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import {
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import { enrollmentSignatureService } from "@/lib/services/enrollment/signature.service";
import { enrollmentDocumentService } from "@/lib/services/enrollment/document.service";
import { evaluateEnrollmentCompleteness } from "@/lib/enrollment/completeness";
import { buildEnrollmentCsv } from "@/lib/enrollment/export-csv";

type ExportFormat = "html" | "txt" | "csv";

/**
 * GET /api/enrollment/files/[id]/export?format=html|txt|csv
 * csv = classeur Excel (UTF-8 BOM, séparateur ;) — parents + enfants, sans fichiers.
 */
export const GET = withPrivilege(
  PrivilegeName.MANAGE_ENROLLMENTS,
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;
      const raw = request.nextUrl.searchParams.get("format") ?? "html";
      const format: ExportFormat =
        raw === "txt" || raw === "csv" ? raw : "html";

      const file = await enrollmentFileService.getFileById(id);
      if (!file) {
        return errorResponse({
          feedback: "Dossier introuvable",
          status: HttpStatus.NOT_FOUND,
        });
      }

      const form = file.parsedFormPayload;

      if (format === "csv") {
        const csv = buildEnrollmentCsv({
          campaignName: file.campaign?.name,
          email: file.email,
          status: file.status,
          familyName: file.family?.name,
          form,
        });
        const filename = `dossier-${id.slice(0, 8)}.csv`;
        return new Response(csv, {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "private, no-store",
          },
        });
      }

      const [documents, signatures] = await Promise.all([
        enrollmentDocumentService.listByFileToken(file.token),
        enrollmentSignatureService.listByFileToken(file.token),
      ]);
      const completeness = evaluateEnrollmentCompleteness({
        form,
        documents,
        signatures,
      });

      const lines: string[] = [
        `Dossier d'inscription — ${file.campaign?.name ?? ""}`,
        `Email: ${file.email}`,
        `Statut: ${file.status}`,
        `Token: ${file.token}`,
        "",
        "=== Responsables ===",
        ...form.parents.map(
          (p, i) =>
            `R${i + 1}: ${p.firstName} ${p.lastName} <${p.email}> — ${p.phoneMobile}`
        ),
        "",
        "=== Enfants ===",
        ...form.children.map(
          (c) =>
            `- ${c.firstName} ${c.lastName}, né(e) le ${c.birthDate} à ${c.birthPlace} — niveau ${c.targetLevel}`
        ),
        "",
        `Saquetas: ${form.consents.saquetasQuantity}`,
        "",
        "=== Signatures ===",
        ...signatures.map(
          (s) =>
            `- [${s.status}] ${s.subjectKey} ${s.scopeRef || "(responsable)"} — ${s.email}`
        ),
        "",
        "=== Documents ===",
        ...documents.map(
          (d) =>
            `- ${d.category} ${d.scopeRef || ""} — ${d.originalName} (${d.sizeBytes} o)`
        ),
        "",
        `Complétude docs: ${completeness.docsOk ? "OK" : "KO"}`,
        `Complétude signatures: ${completeness.signaturesOk ? "OK" : "KO"}`,
        ...(file.history?.length
          ? [
              "",
              "=== Historique ===",
              ...file.history.map(
                (h) =>
                  `${h.timestamp.toISOString?.() ?? h.timestamp} : ${h.oldStatus} → ${h.newStatus}${h.note ? ` (${h.note})` : ""}`
              ),
            ]
          : []),
      ];

      const body = lines.join("\n");
      const filename = `dossier-${id.slice(0, 8)}.${format === "txt" ? "txt" : "html"}`;

      if (format === "txt") {
        return new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "private, no-store",
          },
        });
      }

      const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Dossier ${file.email}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #111; }
    h1 { font-size: 1.4rem; }
    pre { white-space: pre-wrap; font-family: ui-monospace, monospace; font-size: 0.85rem; line-height: 1.45; }
    @media print { body { margin: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <p class="no-print"><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></p>
  <h1>Dossier d'inscription</h1>
  <pre>${body.replace(/</g, "&lt;")}</pre>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "private, no-store",
        },
      });
    } catch (error) {
      return handleApiError(error, "Erreur export dossier");
    }
  }
);
