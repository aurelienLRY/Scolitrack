"use client";

import type { EnrollmentParentForm } from "@/types/enrollment-form.type";

interface ChildSignaturesPanelProps {
  fileToken: string;
  childLocalId: string;
  childName: string;
  parents: [EnrollmentParentForm, EnrollmentParentForm];
  readOnly?: boolean;
}

/**
 * Les autorisations enfant sont incluses dans l'email groupé
 * de chaque responsable (onglet Signatures du parent).
 */
export default function ChildSignaturesPanel({
  childName,
  parents,
}: ChildSignaturesPanelProps) {
  const displayName = childName.trim() || "cet enfant";
  const withEmail = parents.filter((p) => p.email?.includes("@"));

  return (
    <div className="rounded-lg border border-border/60 bg-muted/15 p-4">
      <h4 className="font-semibold">Autorisations — {displayName}</h4>
      <p className="mt-2 text-sm text-muted-foreground">
        Sorties, droit à l&apos;image, consentement médical, etc. sont signés
        dans le <strong className="text-foreground">même email</strong> que les
        engagements du responsable — onglet{" "}
        <strong className="text-foreground">Signatures</strong> de chaque
        parent.
      </p>
      {withEmail.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {withEmail.map((p, i) => (
            <li key={p.email + i}>
              {`${p.firstName} ${p.lastName}`.trim() || `Responsable ${i + 1}`}{" "}
              · {p.email}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
          Renseignez l&apos;email des responsables pour pouvoir envoyer le lien.
        </p>
      )}
    </div>
  );
}
