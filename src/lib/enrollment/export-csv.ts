/**
 * Export tableur (CSV UTF-8 BOM) — 1 ligne par enfant + colonnes parents.
 * Ouvert directement dans Excel / LibreOffice (publipostage, filtres…).
 */

import type { EnrollmentFormPayload } from "@/types/enrollment-form.type";

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Séparateur `;` pour Excel FR */
function row(cells: unknown[]): string {
  return cells.map(csvEscape).join(";");
}

const PARENT_HEADERS = [
  "prenom",
  "nom",
  "role",
  "email",
  "tel_mobile",
  "tel_fixe",
  "adresse",
  "code_postal",
  "ville",
  "profession",
  "situation",
  "commission_id",
] as const;

function parentCells(
  p: EnrollmentFormPayload["parents"][0] | undefined
): string[] {
  if (!p) return PARENT_HEADERS.map(() => "");
  return [
    p.firstName,
    p.lastName,
    p.role,
    p.email,
    p.phoneMobile,
    p.phoneLandline,
    p.address,
    p.postalCode,
    p.city,
    p.profession,
    p.maritalStatus,
    p.commissionId,
  ];
}

export function buildEnrollmentCsv(input: {
  campaignName?: string;
  email: string;
  status: string;
  familyName?: string | null;
  form: EnrollmentFormPayload;
}): string {
  const header = [
    "campagne",
    "email_dossier",
    "statut",
    "famille",
    "saquetas",
    ...PARENT_HEADERS.map((h) => `parent1_${h}`),
    ...PARENT_HEADERS.map((h) => `parent2_${h}`),
    "enfant_prenom",
    "enfant_nom",
    "enfant_date_naissance",
    "enfant_lieu_naissance",
    "enfant_niveau",
    "enfant_date_entree",
    "enfant_ecole_precedente",
    "enfant_assurance",
    "enfant_num_assurance",
    "enfant_dort_parent1",
    "enfant_dort_parent2",
    "enfant_dort_ailleurs",
    "enfant_adresse_autre",
  ];

  const children =
    input.form.children.length > 0
      ? input.form.children
      : [
          {
            firstName: "",
            lastName: "",
            birthDate: "",
            birthPlace: "",
            targetLevel: "",
            entryDate: "",
            previousSchool: "",
            insuranceProvider: "",
            insuranceNumber: "",
            sleepsAtParent1: false,
            sleepsAtParent2: false,
            sleepsElsewhere: false,
            otherResidenceAddress: "",
            otherResidencePostalCode: "",
            otherResidenceCity: "",
          },
        ];

  const lines = [
    row(header),
    ...children.map((c) =>
      row([
        input.campaignName ?? "",
        input.email,
        input.status,
        input.familyName ?? "",
        input.form.consents?.saquetasQuantity ?? 0,
        ...parentCells(input.form.parents[0]),
        ...parentCells(input.form.parents[1]),
        c.firstName,
        c.lastName,
        c.birthDate,
        c.birthPlace,
        c.targetLevel,
        c.entryDate,
        c.previousSchool,
        c.insuranceProvider,
        c.insuranceNumber,
        c.sleepsAtParent1 ? "oui" : "non",
        c.sleepsAtParent2 ? "oui" : "non",
        c.sleepsElsewhere ? "oui" : "non",
        [
          c.otherResidenceAddress,
          c.otherResidencePostalCode,
          c.otherResidenceCity,
        ]
          .filter(Boolean)
          .join(" "),
      ])
    ),
  ];

  // BOM UTF-8 pour qu’Excel ouvre correctement les accents
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
