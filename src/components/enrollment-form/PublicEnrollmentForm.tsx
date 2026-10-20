"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Input,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { toast } from "sonner";
import { Plus, Save, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  useUpdateEnrollmentFileByToken,
  useUpdateEnrollmentFile,
  useCommissions,
} from "@/hooks";
import { FetchService } from "@/lib/services/fetch.service";
import { evaluateEnrollmentCompleteness } from "@/lib/enrollment/completeness";
import type { EnrollmentFileWithDetails } from "@/types/enrollment.type";
import GuardianWorkspace from "@/components/enrollment-form/GuardianWorkspace";
import FamilyContactsSection from "@/components/enrollment-form/FamilyContactsSection";
import ChildEnrollmentCard from "@/components/enrollment-form/ChildEnrollmentCard";
import EnrollmentDocumentsSection from "@/components/enrollment-form/EnrollmentDocumentsSection";
import {
  enrollmentTabsListClass,
  enrollmentTabsTriggerClass,
} from "@/components/enrollment-form/enrollment-tabs.styles";
import {
  createEmptyChild,
  createEmptyFormPayload,
  normalizeFormPayload,
  type EnrollmentChildForm,
  type EnrollmentFormPayload,
  type EnrollmentParentForm,
} from "@/types/enrollment-form.type";

export type EnrollmentFormMode = "public" | "staff-view" | "staff-edit";

function guardianTabLabel(p: EnrollmentParentForm, fallback: string) {
  const name = `${p.firstName} ${p.lastName}`.trim();
  return name || fallback;
}

type FileWithPayload = EnrollmentFileWithDetails & {
  parsedFormPayload?: EnrollmentFormPayload;
  formPayload?: string | null;
};

interface PublicEnrollmentFormProps {
  token: string;
  file: FileWithPayload;
  /** public = parents ; staff-view = lecture ; staff-edit = modification staff */
  mode?: EnrollmentFormMode;
  /** Masque le bandeau d'accueil (ex. page staff avec son propre header) */
  compactHeader?: boolean;
}

function newLocalId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isChildReady(c: EnrollmentChildForm) {
  return Boolean(
    c.firstName?.trim() &&
      c.lastName?.trim() &&
      c.birthDate &&
      c.birthPlace?.trim() &&
      c.targetLevel
  );
}

function isParentReady(p: EnrollmentParentForm) {
  return Boolean(
    p.firstName?.trim() &&
      p.lastName?.trim() &&
      p.email?.includes("@") &&
      p.phoneMobile?.trim() &&
      p.address?.trim() &&
      p.postalCode?.trim() &&
      p.city?.trim() &&
      p.commissionId
  );
}

function parentRequiredFlags(p: EnrollmentParentForm): boolean[] {
  return [
    Boolean(p.firstName?.trim()),
    Boolean(p.lastName?.trim()),
    Boolean(p.email?.includes("@")),
    Boolean(p.phoneMobile?.trim()),
    Boolean(p.address?.trim()),
    Boolean(p.postalCode?.trim()),
    Boolean(p.city?.trim()),
    Boolean(p.commissionId),
  ];
}

function childRequiredFlags(c: EnrollmentChildForm): boolean[] {
  return [
    Boolean(c.firstName?.trim()),
    Boolean(c.lastName?.trim()),
    Boolean(c.birthDate),
    Boolean(c.birthPlace?.trim()),
    Boolean(c.targetLevel),
  ];
}

function parentStarted(p: EnrollmentParentForm) {
  return Boolean(
    p.firstName?.trim() ||
      p.lastName?.trim() ||
      (p.email && p.email.includes("@")) ||
      p.phoneMobile?.trim() ||
      p.address?.trim() ||
      p.commissionId
  );
}

/**
 * % = champs obligatoires remplis / total.
 * Parent 2 n'entre dans le calcul que s'il a commencé à être rempli.
 * Sans enfant : 3 cases « enfant » restent à 0.
 */
function computeCompletionPercent(form: EnrollmentFormPayload) {
  const flags: boolean[] = [...parentRequiredFlags(form.parents[0])];

  if (form.children.length === 0) {
    flags.push(false, false, false, false, false);
  } else {
    for (const c of form.children) {
      flags.push(...childRequiredFlags(c));
    }
  }

  if (parentStarted(form.parents[1])) {
    flags.push(...parentRequiredFlags(form.parents[1]));
  }

  if (flags.length === 0) return 0;
  const filled = flags.filter(Boolean).length;
  return Math.round((filled / flags.length) * 100);
}

export default function PublicEnrollmentForm({
  token,
  file,
  mode = "public",
  compactHeader = false,
}: PublicEnrollmentFormProps) {
  const isStaff = mode === "staff-view" || mode === "staff-edit";
  const updateByToken = useUpdateEnrollmentFileByToken(token);
  const updateStaff = useUpdateEnrollmentFile(file.id);
  const { data: commissionsData, isLoading: commissionsLoading } =
    useCommissions();
  const commissions = useMemo(
    () =>
      (commissionsData?.data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
      })),
    [commissionsData?.data]
  );

  const [activeChild, setActiveChild] = useState(0);
  const [form, setForm] = useState<EnrollmentFormPayload>(() =>
    normalizeFormPayload(
      file.parsedFormPayload ?? createEmptyFormPayload(file.email),
      file.email
    )
  );
  const formRef = useRef(form);
  formRef.current = form;

  const readOnly =
    mode === "staff-view" ||
    (mode === "public" &&
      file.status !== "DRAFT" &&
      file.status !== "NEED_INFO");

  const isSaving =
    updateByToken.isPending || (isStaff && updateStaff.isPending);

  const { data: remoteCompleteness, refetch: refetchCompleteness } = useQuery({
    queryKey: ["enrollment-token-completeness", token],
    queryFn: async () => {
      const res = await FetchService.get<{
        docsOk: boolean;
        signaturesOk: boolean;
        blockers: string[];
        missingDocs: { label: string }[];
        missingSignatures: { label: string }[];
      }>(`/api/enrollment/files/token/${encodeURIComponent(token)}/completeness`);
      return res.data;
    },
    enabled: mode === "public" && Boolean(token),
    refetchOnWindowFocus: true,
  });

  // Rafraîchir la checklist après sauvegarde / focus onglet documents
  useEffect(() => {
    if (mode !== "public") return;
    const onFocus = () => {
      void refetchCompleteness();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [mode, refetchCompleteness]);

  const formReady = useMemo(() => {
    if (form.children.length < 1) return false;
    if (!form.children.every(isChildReady)) return false;
    if (!isParentReady(form.parents[0])) return false;
    const p2 = form.parents[1];
    const p2Started = Boolean(
      p2.firstName?.trim() ||
        p2.lastName?.trim() ||
        (p2.email && p2.email.includes("@"))
    );
    if (p2Started && !isParentReady(p2)) return false;
    return true;
  }, [form]);

  const canSubmit = Boolean(
    formReady &&
      remoteCompleteness?.docsOk &&
      remoteCompleteness?.signaturesOk
  );

  const completionPercent = useMemo(
    () => (canSubmit ? 100 : computeCompletionPercent(form)),
    [canSubmit, form]
  );

  const submitBlockers = useMemo(() => {
    const reasons: string[] = [];
    if (form.children.length < 1) {
      reasons.push("ajoutez au moins un enfant");
    } else if (!form.children.every(isChildReady)) {
      reasons.push(
        "complétez chaque enfant (identité, lieu de naissance, classe)"
      );
    }
    if (!isParentReady(form.parents[0])) {
      reasons.push("complétez le responsable légal 1");
    }
    const p2 = form.parents[1];
    const p2Started = Boolean(
      p2.firstName?.trim() ||
        p2.lastName?.trim() ||
        (p2.email && p2.email.includes("@"))
    );
    if (p2Started && !isParentReady(p2)) {
      reasons.push("complétez le responsable légal 2");
    }
    if (remoteCompleteness?.blockers?.length) {
      reasons.push(...remoteCompleteness.blockers);
    } else if (formReady) {
      // Estimation locale si l'API n'a pas encore répondu
      const local = evaluateEnrollmentCompleteness({
        form,
        documents: [],
        signatures: [],
      });
      if (!remoteCompleteness && local.blockers.length) {
        reasons.push(...local.blockers);
      }
    }
    return reasons;
  }, [form, formReady, remoteCompleteness]);

  const updateParent = (
    index: 0 | 1,
    patch: Partial<EnrollmentParentForm>
  ) => {
    setForm((prev) => {
      const parents: [EnrollmentParentForm, EnrollmentParentForm] = [
        { ...prev.parents[0] },
        { ...prev.parents[1] },
      ];
      parents[index] = { ...parents[index], ...patch };
      return { ...prev, parents };
    });
  };

  const updateChild = (index: number, patch: Partial<EnrollmentChildForm>) => {
    setForm((prev) => {
      const children = prev.children.map((c, i) =>
        i === index ? { ...c, ...patch } : c
      );
      return { ...prev, children };
    });
  };

  const addChild = () => {
    setForm((prev) => ({
      ...prev,
      children: [...prev.children, createEmptyChild(newLocalId())],
    }));
    setActiveChild(form.children.length);
  };

  const removeChild = (index: number) => {
    setForm((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
    }));
    setActiveChild((prev) => Math.max(0, prev - (prev >= index ? 1 : 0)));
  };

  const persist = (status: "DRAFT" | "SUBMITTED") => {
    const current = formRef.current;
    if (mode === "staff-edit") {
      updateStaff.mutate({
        email: current.parents[0]?.email || file.email,
        formPayload: current,
        ...current.consents,
      });
      return;
    }
    if (status === "SUBMITTED" && !canSubmit) {
      void refetchCompleteness();
      toast.error(
        submitBlockers.length
          ? `Dossier incomplet : ${submitBlockers.join(" ; ")}`
          : "Dossier incomplet"
      );
      return;
    }
    // Feedback toast unique via useApiMutation (data.feedback de l'API)
    updateByToken.mutate(
      {
        email: current.parents[0]?.email || file.email,
        status,
        formPayload: current,
        ...current.consents,
      },
      {
        onSuccess: () => {
          void refetchCompleteness();
        },
      }
    );
  };

  const title =
    mode === "staff-view"
      ? "Consultation du dossier"
      : mode === "staff-edit"
        ? "Modification du dossier"
        : "Bienvenue sur votre dossier d'inscription";

  const statusLabel: Record<string, string> = {
    DRAFT: "Brouillon",
    SUBMITTED: "Soumis",
    NEED_INFO: "A compléter",
    APPROVED: "Approuvé",
    REJECTED: "Refusé",
  };

  const child = form.children[activeChild];
  const parentSummary = (p: EnrollmentParentForm, fallback: string) => {
    const name = `${p.firstName} ${p.lastName}`.trim();
    return name || fallback;
  };

  return (
    <div className="space-y-4">
      {!compactHeader && (
        <Card className="space-y-4 p-6" variant="primary">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Escòla Calandreta Los Cascamèls
                {file.campaign?.name ? ` · ${file.campaign.name}` : ""}
                {isStaff ? ` · ${file.email}` : ""}
              </p>
            </div>
            <Badge variant="info" styleVariant="outline">
              {statusLabel[file.status] ?? file.status}
            </Badge>
          </div>
          {mode === "public" && (
            <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
              <p>
                Merci de remplir l&apos;ensemble du formulaire. Vous pouvez
                enregistrer un brouillon à tout moment, puis soumettre lorsque
                tout est prêt.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Responsables</strong> —
                  coordonnées de chaque détenteur de l&apos;autorité parentale,
                  puis signatures des engagements (horaires, adhésion,
                  règlements…).
                </li>
                <li>
                  <strong className="text-foreground">Contacts famille</strong>{" "}
                  — facultatif : urgences et personnes autorisées à récupérer
                  les enfants.
                </li>
                <li>
                  <strong className="text-foreground">Enfants</strong> — ajoutez
                  chaque enfant concerné, puis signez les autorisations qui
                  s&apos;y rapportent (sorties, droit à l&apos;image…).
                </li>
                <li>
                  <strong className="text-foreground">Saquetas</strong> —
                  indiquez le nombre souhaité (5&nbsp;€ / pièce), ou laissez à
                  0.
                </li>
                <li>
                  <strong className="text-foreground">Documents</strong> —
                  livret de famille, vaccination et assurance (obligatoires
                  pour soumettre).
                </li>
              </ul>
            </div>
          )}
          {mode === "staff-view" && (
            <p className="text-sm text-muted-foreground">
              Lecture seule — utilisez « Modifier » pour changer les
              informations.
            </p>
          )}
          {mode === "staff-edit" && (
            <p className="text-sm text-muted-foreground">
              Vous pouvez corriger les champs du dossier. Le statut se gère
              séparément en haut de page.
            </p>
          )}
          {!readOnly && mode === "public" && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Avancement du dossier</span>
                <span className="font-medium text-foreground">
                  {completionPercent}&nbsp;%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300 dark:bg-white"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          )}
        </Card>
      )}

      <Tabs defaultValue="guardian-1" className="space-y-4">
        <TabsList className={enrollmentTabsListClass}>
          <TabsTrigger
            value="guardian-1"
            className={enrollmentTabsTriggerClass}
          >
            {guardianTabLabel(form.parents[0], "Responsable 1")}
          </TabsTrigger>
          <TabsTrigger
            value="guardian-2"
            className={enrollmentTabsTriggerClass}
          >
            {guardianTabLabel(form.parents[1], "Responsable 2")}
          </TabsTrigger>
          <TabsTrigger value="contacts" className={enrollmentTabsTriggerClass}>
            Contacts famille
          </TabsTrigger>
          <TabsTrigger value="children" className={enrollmentTabsTriggerClass}>
            Enfants
          </TabsTrigger>
          <TabsTrigger value="consents" className={enrollmentTabsTriggerClass}>
            Saquetas
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className={enrollmentTabsTriggerClass}
          >
            Documents
          </TabsTrigger>
          <TabsTrigger value="infos" className={enrollmentTabsTriggerClass}>
            Récap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guardian-1" className="space-y-4">
          <GuardianWorkspace
            title="Responsable légal 1"
            subtitle="Premier détenteur de l'autorité parentale"
            parent={form.parents[0]}
            readOnly={readOnly}
            commissions={commissions}
            commissionsLoading={commissionsLoading}
            onChange={(patch) => updateParent(0, patch)}
            fileToken={token}
            guardianLabel={guardianTabLabel(form.parents[0], "Responsable 1")}
            childList={form.children}
            onAutoSave={readOnly ? undefined : () => persist("DRAFT")}
          />
        </TabsContent>

        <TabsContent value="guardian-2" className="space-y-4">
          <GuardianWorkspace
            title="Responsable légal 2"
            subtitle="Second détenteur de l'autorité parentale"
            parent={form.parents[1]}
            readOnly={readOnly}
            commissions={commissions}
            commissionsLoading={commissionsLoading}
            onChange={(patch) => updateParent(1, patch)}
            fileToken={token}
            guardianLabel={guardianTabLabel(form.parents[1], "Responsable 2")}
            childList={form.children}
            onAutoSave={readOnly ? undefined : () => persist("DRAFT")}
          />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <FamilyContactsSection
            readOnly={readOnly}
            emergencyContacts={form.emergencyContacts}
            authorizedPickups={form.authorizedPickups}
            onChangeEmergency={(emergencyContacts) =>
              setForm((prev) => ({ ...prev, emergencyContacts }))
            }
            onChangePickups={(authorizedPickups) =>
              setForm((prev) => ({ ...prev, authorizedPickups }))
            }
          />
        </TabsContent>

        <TabsContent value="children" className="space-y-4">
          <Card className="space-y-1 p-4" variant="primary">
            <h3 className="font-semibold">Enfants</h3>
            <p className="text-sm text-muted-foreground">
              Ajoutez chaque enfant à inscrire. Les autorisations qui le
              concernent se signent juste en dessous de sa fiche.
            </p>
          </Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {form.children.map((c, i) => (
                <Button
                  key={c.localId}
                  type="button"
                  size="sm"
                  variant={i === activeChild ? "solid" : "outline"}
                  color="secondary"
                  className={
                    i === activeChild
                      ? "bg-white text-slate-900 hover:bg-white/90"
                      : "border-white/30 bg-white/10 text-foreground hover:bg-white/20"
                  }
                  onClick={() => setActiveChild(i)}
                >
                  {c.firstName || c.lastName
                    ? `${c.firstName} ${c.lastName}`.trim()
                    : `Enfant ${i + 1}`}
                </Button>
              ))}
            </div>
            {!readOnly && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                color="secondary"
                className="border-white/40 bg-white text-slate-900 hover:bg-white/90"
                onClick={addChild}
              >
                <Plus className="mr-1 h-4 w-4" />
                Ajouter un enfant
              </Button>
            )}
          </div>

          {form.children.length === 0 && (
            <Card
              className="p-6 text-center text-muted-foreground"
              variant="primary"
            >
              Aucun enfant pour le moment. Ajoutez-en au moins un avant de
              soumettre.
            </Card>
          )}

          {child && (
            <ChildEnrollmentCard
              child={child}
              index={activeChild}
              readOnly={readOnly}
              fileToken={token}
              parents={form.parents}
              onChange={(patch) => updateChild(activeChild, patch)}
              onRemove={() => removeChild(activeChild)}
            />
          )}
        </TabsContent>

        <TabsContent value="consents" className="space-y-4">
          <Card className="space-y-3 p-4" variant="primary">
            <h3 className="font-semibold">Saquetas</h3>
            <p className="text-sm text-muted-foreground">
              Indiquez le nombre de saquetas à commander (5&nbsp;€ /
              pièce). Vous pouvez laisser 0.
            </p>
            <Input
              label="Nombre de saquetas"
              type="number"
              min={0}
              value={String(form.consents.saquetasQuantity)}
              disabled={readOnly}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  consents: {
                    ...prev.consents,
                    saquetasQuantity: Number(e.target.value) || 0,
                  },
                }))
              }
            />
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <EnrollmentDocumentsSection
            fileToken={token}
            readOnly={readOnly}
            childList={form.children}
          />
        </TabsContent>

        <TabsContent value="infos" className="space-y-3">
          <Card className="space-y-3 p-5" variant="primary">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Récapitulatif</h3>
              <span className="text-sm font-medium">
                {completionPercent}&nbsp;%
              </span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                Responsable 1 :{" "}
                <span className="text-foreground">
                  {parentSummary(form.parents[0], "—")}
                </span>
              </li>
              <li>
                Responsable 2 :{" "}
                <span className="text-foreground">
                  {parentSummary(form.parents[1], "—")}
                </span>
              </li>
              <li>
                Commissions :{" "}
                <span className="text-foreground">
                  {[form.parents[0].commissionId, form.parents[1].commissionId]
                    .map(
                      (id) =>
                        commissions.find((c) => c.id === id)?.name ||
                        (id ? "…" : "non choisie")
                    )
                    .join(" · ")}
                </span>
              </li>
              <li>
                Contacts d&apos;urgence : {form.emergencyContacts.length}
              </li>
              <li>
                Personnes autorisées : {form.authorizedPickups.length}
              </li>
              <li>Enfants : {form.children.length}</li>
              <li>Saquetas : {form.consents.saquetasQuantity}</li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>

      {!readOnly && (
        <div className="sticky bottom-4 space-y-2 rounded-md border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur">
          {mode === "public" && (
            <>
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Avancement</span>
                <span className="font-semibold text-foreground">
                  {completionPercent}&nbsp;%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              className="border-border bg-white text-slate-900 hover:bg-white/90 dark:bg-white dark:text-slate-900"
              onClick={() => persist("DRAFT")}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
            {mode === "public" && (
              <>
                <Button
                  type="button"
                  color="secondary"
                  className="bg-white text-slate-900 hover:bg-white/90 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                  onClick={() => persist("SUBMITTED")}
                  disabled={isSaving || !canSubmit}
                  tooltip={
                    !canSubmit && submitBlockers.length
                      ? `Pour soumettre : ${submitBlockers.join(" ; ")}`
                      : undefined
                  }
                >
                  <Send className="mr-2 h-4 w-4" />
                  Soumettre le dossier
                </Button>
                {!canSubmit && submitBlockers.length > 0 ? (
                  <p className="text-xs text-muted-foreground sm:ml-1">
                    {submitBlockers.join(" · ")}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
