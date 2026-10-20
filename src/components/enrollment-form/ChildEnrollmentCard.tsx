"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Input,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { Trash2 } from "lucide-react";
import ChildSignaturesPanel from "@/components/enrollment-form/ChildSignaturesPanel";
import ChildDocumentsPanel from "@/components/enrollment-form/ChildDocumentsPanel";
import ChildDocumentSlot from "@/components/enrollment-form/ChildDocumentSlot";
import {
  enrollmentSubTabsListClass,
  enrollmentSubTabsTriggerClass,
} from "@/components/enrollment-form/enrollment-tabs.styles";
import type {
  EducationLevelCode,
  EnrollmentChildForm,
  EnrollmentMedicalForm,
  EnrollmentParentForm,
} from "@/types/enrollment-form.type";

const LEVEL_OPTIONS: { value: EducationLevelCode | ""; label: string }[] = [
  { value: "", label: "Choisir…" },
  { value: "PS1", label: "PS 1" },
  { value: "PS2", label: "PS 2" },
  { value: "MS", label: "MS" },
  { value: "GS", label: "GS" },
  { value: "CP", label: "CP" },
  { value: "CE1", label: "CE 1" },
  { value: "CE2", label: "CE 2" },
  { value: "CM1", label: "CM 1" },
  { value: "CM2", label: "CM 2" },
];

type MedicalBoolKey = {
  [K in keyof EnrollmentMedicalForm]: EnrollmentMedicalForm[K] extends boolean
    ? K
    : never;
}[keyof EnrollmentMedicalForm];

const DISEASES: { key: MedicalBoolKey; label: string }[] = [
  { key: "hasRubella", label: "Rubéole" },
  { key: "hasChickenpox", label: "Varicelle" },
  { key: "hasTonsillitis", label: "Angines" },
  { key: "hasOtitis", label: "Otites" },
  { key: "hasScarletFever", label: "Scarlatine" },
  { key: "hasWhoopingCough", label: "Coqueluche" },
  { key: "hasMumps", label: "Oreillons" },
  { key: "hasMeasles", label: "Rougeole" },
  { key: "hasAsthma", label: "Asthme" },
  { key: "hasRheumatism", label: "Rhumatismes" },
];

function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
      <div>
        <h4 className="text-sm font-semibold tracking-wide text-foreground">
          {title}
        </h4>
        {hint ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FieldSelect({
  label,
  value,
  disabled,
  onChange,
  options,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="w-full">
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value || "empty"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function levelHint(level: EducationLevelCode | ""): string | null {
  if (level === "PS1" || level === "PS2") {
    return "Petite section : prévoir une rentrée progressive si besoin, un moyen de garde de secours, et les affaires de sieste (coussin, couvertures — à laver à chaque vacances). Couches non fournies par l'école.";
  }
  if (level === "MS" || level === "GS") {
    return "Maternelle : goûters matin et après-midi conseillés ; affaires marquées au nom de l'enfant.";
  }
  if (level === "CP" || level === "CE1" || level === "CE2" || level === "CM1" || level === "CM2") {
    return "Élémentaire : horaires à respecter (arrivée avant 9 h / 14 h). Une autorisation de sortie seule peut concerner les plus de 6 ans.";
  }
  return null;
}

function isMaternelle(level: EducationLevelCode | ""): boolean {
  return level === "PS1" || level === "PS2" || level === "MS" || level === "GS";
}

type ChildTab = "info" | "health" | "documents" | "signatures";

const navBtnClass =
  "border border-white/50 bg-white text-slate-900 dark:bg-white dark:text-slate-900";

function parentShortLabel(p: EnrollmentParentForm, fallback: string) {
  const name = `${p.firstName} ${p.lastName}`.trim();
  return name || fallback;
}

interface ChildEnrollmentCardProps {
  child: EnrollmentChildForm;
  index: number;
  readOnly: boolean;
  fileToken: string;
  parents: [EnrollmentParentForm, EnrollmentParentForm];
  onChange: (patch: Partial<EnrollmentChildForm>) => void;
  onRemove: () => void;
}

export default function ChildEnrollmentCard({
  child,
  index,
  readOnly,
  fileToken,
  parents,
  onChange,
  onRemove,
}: ChildEnrollmentCardProps) {
  const [tab, setTab] = useState<ChildTab>("info");
  const displayName =
    `${child.firstName} ${child.lastName}`.trim() || `Enfant ${index + 1}`;
  const hint = levelHint(child.targetLevel);
  const showPreviousSchoolExtra = Boolean(child.previousSchool?.trim());

  const updateMedical = (patch: Partial<EnrollmentMedicalForm>) => {
    onChange({ medical: { ...child.medical, ...patch } });
  };

  return (
    <Card className="overflow-hidden p-0" variant="primary">
      <header className="flex items-start justify-between gap-3 border-b border-border/50 bg-muted/30 px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold">{displayName}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Fiche enfant
            {child.targetLevel
              ? ` · ${LEVEL_OPTIONS.find((o) => o.value === child.targetLevel)?.label}`
              : ""}
          </p>
        </div>
        {!readOnly && (
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            color="destructive"
            icon={Trash2}
            iconOnly
            tooltip="Retirer cet enfant"
            onClick={onRemove}
          />
        )}
      </header>

      <div className="space-y-4 p-5">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as ChildTab)}
          className="space-y-4"
        >
          <TabsList className={`${enrollmentSubTabsListClass} justify-center`}>
            <TabsTrigger value="info" className={enrollmentSubTabsTriggerClass}>
              Renseignements
            </TabsTrigger>
            <TabsTrigger
              value="health"
              className={enrollmentSubTabsTriggerClass}
            >
              Santé
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className={enrollmentSubTabsTriggerClass}
            >
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="signatures"
              className={enrollmentSubTabsTriggerClass}
            >
              Signatures
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-0 space-y-4">
            <FormSection title="Identité">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Nom"
                  value={child.lastName}
                  disabled={readOnly}
                  onChange={(e) => onChange({ lastName: e.target.value })}
                />
                <Input
                  label="Prénom"
                  value={child.firstName}
                  disabled={readOnly}
                  onChange={(e) => onChange({ firstName: e.target.value })}
                />
                <Input
                  label="Date de naissance"
                  type="date"
                  value={child.birthDate}
                  disabled={readOnly}
                  onChange={(e) => onChange({ birthDate: e.target.value })}
                />
                <Input
                  label="Lieu de naissance"
                  value={child.birthPlace}
                  disabled={readOnly}
                  onChange={(e) => onChange({ birthPlace: e.target.value })}
                />
              </div>
            </FormSection>

            <FormSection
              title="Scolarité"
              hint="Classe d'inscription et parcours"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldSelect
                  label="Inscription en"
                  value={child.targetLevel}
                  disabled={readOnly}
                  onChange={(v) =>
                    onChange({ targetLevel: v as EducationLevelCode })
                  }
                  options={LEVEL_OPTIONS}
                />
                <Input
                  label="Date d'entrée à la Calandreta"
                  type="date"
                  value={child.entryDate}
                  disabled={readOnly}
                  onChange={(e) => onChange({ entryDate: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Établissement fréquenté auparavant"
                    value={child.previousSchool}
                    disabled={readOnly}
                    onChange={(e) =>
                      onChange({ previousSchool: e.target.value })
                    }
                  />
                </div>
                {showPreviousSchoolExtra ? (
                  <Input
                    label="Date de radiation"
                    type="date"
                    value={child.radiationDate}
                    disabled={readOnly}
                    onChange={(e) =>
                      onChange({ radiationDate: e.target.value })
                    }
                  />
                ) : null}
              </div>
              {hint ? (
                <p className="rounded-md border border-border/50 bg-background/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  {hint}
                </p>
              ) : null}
              {isMaternelle(child.targetLevel) ? (
                <p className="text-xs text-muted-foreground">
                  Pour les maternelles : ramener les affaires prêtées lors d&apos;un
                  change occasionnel ; renouvellement possible en cours d&apos;année
                  (mouchoirs, matériel…).
                </p>
              ) : null}
            </FormSection>

            <FormSection
              title="Résidence de l'enfant"
              hint="Où dort habituellement l'enfant ? Plusieurs choix possibles."
            >
              <ul className="space-y-2.5">
                <li>
                  <label className="flex items-start gap-2.5 text-sm">
                    <Checkbox
                      checked={child.sleepsAtParent1}
                      disabled={readOnly}
                      onCheckedChange={(v) =>
                        onChange({ sleepsAtParent1: v === true })
                      }
                    />
                    <span>
                      Chez{" "}
                      {parentShortLabel(parents[0], "le responsable légal 1")}
                    </span>
                  </label>
                </li>
                <li>
                  <label className="flex items-start gap-2.5 text-sm">
                    <Checkbox
                      checked={child.sleepsAtParent2}
                      disabled={readOnly}
                      onCheckedChange={(v) =>
                        onChange({ sleepsAtParent2: v === true })
                      }
                    />
                    <span>
                      Chez{" "}
                      {parentShortLabel(parents[1], "le responsable légal 2")}
                    </span>
                  </label>
                </li>
                <li>
                  <label className="flex items-start gap-2.5 text-sm">
                    <Checkbox
                      checked={child.sleepsElsewhere}
                      disabled={readOnly}
                      onCheckedChange={(v) =>
                        onChange({
                          sleepsElsewhere: v === true,
                          ...(v !== true
                            ? {
                                otherResidenceAddress: "",
                                otherResidencePostalCode: "",
                                otherResidenceCity: "",
                              }
                            : {}),
                        })
                      }
                    />
                    <span>Autre domicile</span>
                  </label>
                </li>
              </ul>

              {child.sleepsElsewhere ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-12">
                    <Input
                      label="Adresse"
                      value={child.otherResidenceAddress}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange({ otherResidenceAddress: e.target.value })
                      }
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <Input
                      label="Code postal"
                      value={child.otherResidencePostalCode}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange({
                          otherResidencePostalCode: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="sm:col-span-8">
                    <Input
                      label="Ville"
                      value={child.otherResidenceCity}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange({ otherResidenceCity: e.target.value })
                      }
                    />
                  </div>
                </div>
              ) : null}

              <Input
                label="Responsables légaux"
                value={child.legalGuardians}
                disabled={readOnly}
                placeholder="Si différent des responsables du dossier"
                onChange={(e) => onChange({ legalGuardians: e.target.value })}
              />
            </FormSection>

            <FormSection
              title="Assurance scolaire"
              hint="Responsabilité civile + individuelle accident — attestation obligatoire"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Société d'assurance"
                  value={child.insuranceProvider}
                  disabled={readOnly}
                  onChange={(e) =>
                    onChange({ insuranceProvider: e.target.value })
                  }
                />
                <Input
                  label="N° de contrat"
                  value={child.insuranceNumber}
                  disabled={readOnly}
                  onChange={(e) =>
                    onChange({ insuranceNumber: e.target.value })
                  }
                />
              </div>
              <ChildDocumentSlot
                fileToken={fileToken}
                childLocalId={child.localId}
                category="INSURANCE"
                readOnly={readOnly}
                buttonLabel="Joindre l'attestation d'assurance"
              />
            </FormSection>

            <div className="flex justify-center pt-1">
              <Button
                type="button"
                size="sm"
                variant="soft"
                color="secondary"
                className="border border-white/50 bg-white text-slate-900 dark:bg-white dark:text-slate-900"
                onClick={() => setTab("health")}
              >
                Suivant — Santé
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="health" className="mt-0 space-y-4">
            <FormSection
              title="Antécédents"
              hint="Cochez les maladies déjà contractées"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {DISEASES.map((d) => (
                  <label
                    key={d.key}
                    className="flex items-center gap-2.5 rounded-md border border-border/40 bg-background/40 px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={Boolean(child.medical[d.key])}
                      disabled={readOnly}
                      onCheckedChange={(v) =>
                        updateMedical({ [d.key]: v === true })
                      }
                    />
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>
            </FormSection>

            <FormSection title="Difficultés de santé">
              <Textarea
                label="Allergies, maladie, régime, traitement…"
                value={child.medical.healthDetails}
                disabled={readOnly}
                onChange={(e) =>
                  updateMedical({ healthDetails: e.target.value })
                }
              />
            </FormSection>

            <FormSection title="En cas d'urgence">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Hôpital / clinique souhaité(e)"
                  value={child.medical.preferredHospital}
                  disabled={readOnly}
                  onChange={(e) =>
                    updateMedical({ preferredHospital: e.target.value })
                  }
                />
                <Input
                  label="Médecin traitant"
                  value={child.medical.doctorName}
                  disabled={readOnly}
                  onChange={(e) =>
                    updateMedical({ doctorName: e.target.value })
                  }
                />
              </div>
              <Textarea
                label="Recommandations des parents"
                value={child.medical.parentRecommendations}
                disabled={readOnly}
                onChange={(e) =>
                  updateMedical({ parentRecommendations: e.target.value })
                }
              />
            </FormSection>

            <FormSection
              title="Vaccination"
              hint="Photocopies des pages nominatives — obligatoire pour soumettre"
            >
              <ChildDocumentSlot
                fileToken={fileToken}
                childLocalId={child.localId}
                category="VACCINATION"
                readOnly={readOnly}
                buttonLabel="Joindre les pages de vaccination"
              />
            </FormSection>

            <p className="rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              Si vaccins obligatoires non faits : certificat de
              contre-indication. Le consentement médical d&apos;urgence se signe
              dans Signatures. Les autres pièces sont aussi dans l&apos;onglet
              Documents.
            </p>

            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="soft"
                color="secondary"
                className={navBtnClass}
                onClick={() => setTab("info")}
              >
                Précédent — Renseignements
              </Button>
              <Button
                type="button"
                size="sm"
                variant="soft"
                color="secondary"
                className={navBtnClass}
                onClick={() => setTab("documents")}
              >
                Suivant — Documents
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-0 space-y-4">
            <ChildDocumentsPanel
              fileToken={fileToken}
              childLocalId={child.localId}
              childName={displayName}
              readOnly={readOnly}
            />
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="soft"
                color="secondary"
                className={navBtnClass}
                onClick={() => setTab("health")}
              >
                Précédent — Santé
              </Button>
              <Button
                type="button"
                size="sm"
                variant="soft"
                color="secondary"
                className={navBtnClass}
                onClick={() => setTab("signatures")}
              >
                Suivant — Signatures
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signatures" className="mt-0 space-y-4">
            <ChildSignaturesPanel
              fileToken={fileToken}
              childLocalId={child.localId}
              childName={displayName}
              parents={parents}
              readOnly={readOnly}
            />
            <div className="flex justify-center pt-1">
              <Button
                type="button"
                size="sm"
                variant="soft"
                color="secondary"
                className={navBtnClass}
                onClick={() => setTab("documents")}
              >
                Précédent — Documents
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
