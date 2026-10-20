"use client";

import { Card, Input, Textarea } from "@/components/ui";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import EnrollmentInfoButton from "@/components/enrollment-form/EnrollmentInfoButton";
import {
  sanitizeSocialSecurityInput,
  SOCIAL_SECURITY_MAX_LENGTH,
  type EnrollmentParentForm,
} from "@/types/enrollment-form.type";

const ROLE_OPTIONS = [
  { value: "pere", label: "Père" },
  { value: "mere", label: "Mère" },
  { value: "tuteur", label: "Tuteur" },
  { value: "autre", label: "Autre détenteur" },
];

const MARITAL_OPTIONS = [
  { value: "", label: "—" },
  { value: "celibataire", label: "Célibataire" },
  { value: "marie", label: "Marié(e)" },
  { value: "divorce", label: "Divorcé(e)" },
  { value: "concubinage", label: "Concubinage" },
  { value: "pacse", label: "Pacsé(e)" },
];

function FormSection({
  title,
  hint,
  children,
  action,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold tracking-wide text-foreground">
            {title}
          </h4>
          {hint ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {action}
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

export type CommissionOption = {
  id: string;
  name: string;
};

interface LegalGuardianCardProps {
  title?: string;
  subtitle?: string;
  /** Sans Card/header — contenu seul (ex. dans GuardianWorkspace) */
  embedded?: boolean;
  parent: EnrollmentParentForm;
  readOnly: boolean;
  commissions: CommissionOption[];
  commissionsLoading?: boolean;
  onChange: (patch: Partial<EnrollmentParentForm>) => void;
}

export default function LegalGuardianCard({
  title,
  subtitle,
  embedded = false,
  parent,
  readOnly,
  commissions,
  commissionsLoading,
  onChange,
}: LegalGuardianCardProps) {
  const availabilityItems: {
    key: keyof EnrollmentParentForm["availability"];
    label: string;
  }[] = [
    { key: "canteen", label: "Cantine" },
    { key: "daycare", label: "Garderie du soir" },
    {
      key: "halfDaySubstitute",
      label: "Demi-journée (absence regents / ATSEM / entretien)",
    },
    { key: "housekeeping", label: "Ménage (vacances scolaires)" },
    { key: "greenSpaces", label: "Entretien des espaces verts" },
  ];

  const fields = (
    <div className={embedded ? "space-y-4" : "space-y-4 p-5"}>
        <FormSection title="Statut">
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldSelect
              label="Qualité"
              value={parent.role}
              disabled={readOnly}
              onChange={(v) =>
                onChange({ role: v as EnrollmentParentForm["role"] })
              }
              options={ROLE_OPTIONS}
            />
            <FieldSelect
              label="Situation familiale"
              value={parent.maritalStatus}
              disabled={readOnly}
              onChange={(v) =>
                onChange({
                  maritalStatus: v as EnrollmentParentForm["maritalStatus"],
                })
              }
              options={MARITAL_OPTIONS}
            />
          </div>
        </FormSection>

        <FormSection title="Identité & contact">
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <Input
                label="Nom"
                value={parent.lastName}
                disabled={readOnly}
                onChange={(e) => onChange({ lastName: e.target.value })}
              />
            </div>
            <div className="sm:col-span-7">
              <Input
                label="Prénom"
                value={parent.firstName}
                disabled={readOnly}
                onChange={(e) => onChange({ firstName: e.target.value })}
              />
            </div>
            <div className="sm:col-span-6">
              <Input
                label="Téléphone mobile"
                value={parent.phoneMobile}
                disabled={readOnly}
                onChange={(e) => onChange({ phoneMobile: e.target.value })}
              />
            </div>
            <div className="sm:col-span-6">
              <Input
                label="Téléphone fixe"
                value={parent.phoneLandline}
                disabled={readOnly}
                onChange={(e) => onChange({ phoneLandline: e.target.value })}
              />
            </div>
            <div className="sm:col-span-12">
              <Input
                label="Courriel"
                type="email"
                value={parent.email}
                disabled={readOnly}
                onChange={(e) => onChange({ email: e.target.value })}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Profession">
          <Input
            label="Profession"
            value={parent.profession}
            disabled={readOnly}
            onChange={(e) => onChange({ profession: e.target.value })}
          />
        </FormSection>

        <FormSection title="Sécurité sociale">
          <Input
            label="N° de sécurité sociale"
            value={parent.socialSecurityNum}
            disabled={readOnly}
            maxLength={SOCIAL_SECURITY_MAX_LENGTH}
            inputMode="text"
            autoComplete="off"
            onChange={(e) =>
              onChange({
                socialSecurityNum: sanitizeSocialSecurityInput(e.target.value),
              })
            }
          />
        </FormSection>

        <FormSection title="Adresse">
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="sm:col-span-12">
              <Input
                label="Adresse"
                value={parent.address}
                disabled={readOnly}
                onChange={(e) => onChange({ address: e.target.value })}
              />
            </div>
            <div className="sm:col-span-4">
              <Input
                label="Code postal"
                value={parent.postalCode}
                disabled={readOnly}
                onChange={(e) => onChange({ postalCode: e.target.value })}
              />
            </div>
            <div className="sm:col-span-8">
              <Input
                label="Ville"
                value={parent.city}
                disabled={readOnly}
                onChange={(e) => onChange({ city: e.target.value })}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Vie associative"
          hint="Une commission minimum par parent"
          action={
            <EnrollmentInfoButton docId="commissions" label="Infos commissions" />
          }
        >
          <FieldSelect
            label="Commission"
            value={parent.commissionId}
            disabled={readOnly || commissionsLoading}
            onChange={(v) => onChange({ commissionId: v })}
            options={[
              {
                value: "",
                label: commissionsLoading
                  ? "Chargement…"
                  : "Choisir une commission…",
              },
              ...commissions.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <Textarea
            label="Compétences particulières à mettre à disposition"
            value={parent.skills}
            disabled={readOnly}
            onChange={(e) => onChange({ skills: e.target.value })}
          />
        </FormSection>

        <FormSection
          title="Disponibilités"
          hint="Pour dépanner l'école de temps en temps"
          action={
            <EnrollmentInfoButton
              docId="cantine_garderie"
              label="Infos cantine / garderie"
            />
          }
        >
          <ul className="space-y-2.5">
            {availabilityItems.map((item) => (
              <li key={item.key}>
                <label className="flex items-start gap-2.5 text-sm">
                  <Checkbox
                    checked={parent.availability[item.key]}
                    disabled={readOnly}
                    onCheckedChange={(v) =>
                      onChange({
                        availability: {
                          ...parent.availability,
                          [item.key]: v === true,
                        },
                      })
                    }
                  />
                  <span>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </FormSection>
    </div>
  );

  if (embedded) {
    return fields;
  }

  return (
    <Card className="overflow-hidden p-0" variant="primary">
      {(title || subtitle) && (
        <header className="border-b border-border/50 bg-muted/30 px-5 py-4">
          {title ? <h3 className="text-lg font-semibold">{title}</h3> : null}
          {subtitle ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>
      )}
      {fields}
    </Card>
  );
}
