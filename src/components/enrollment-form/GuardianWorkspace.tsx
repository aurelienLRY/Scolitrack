"use client";

import { useRef, useState } from "react";
import {
  Button,
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LegalGuardianCard, {
  type CommissionOption,
} from "@/components/enrollment-form/LegalGuardianCard";
import GuardianSignaturesPanel from "@/components/enrollment-form/GuardianSignaturesPanel";
import {
  enrollmentSubTabsListClass,
  enrollmentSubTabsTriggerClass,
} from "@/components/enrollment-form/enrollment-tabs.styles";
import type {
  EnrollmentChildForm,
  EnrollmentParentForm,
} from "@/types/enrollment-form.type";

type GuardianTab = "form" | "signatures";

interface GuardianWorkspaceProps {
  title: string;
  subtitle: string;
  parent: EnrollmentParentForm;
  readOnly: boolean;
  commissions: CommissionOption[];
  commissionsLoading?: boolean;
  onChange: (patch: Partial<EnrollmentParentForm>) => void;
  fileToken: string;
  guardianLabel: string;
  /** Enfants inclus dans le même lien de signatures */
  childList?: EnrollmentChildForm[];
  /** Enregistrement automatique au changement d'onglet (Suivant / Précédent) */
  onAutoSave?: () => void;
}

const navBtnClass =
  "border border-white/50 bg-white text-slate-900 shadow-sm hover:bg-white/90 dark:border-white/30 dark:bg-white dark:text-slate-900";

export default function GuardianWorkspace({
  title,
  subtitle,
  parent,
  readOnly,
  commissions,
  commissionsLoading,
  onChange,
  fileToken,
  guardianLabel,
  childList = [],
  onAutoSave,
}: GuardianWorkspaceProps) {
  const [tab, setTab] = useState<GuardianTab>("form");
  const cardRef = useRef<HTMLDivElement>(null);

  const goToTab = (next: GuardianTab) => {
    if (next === tab) return;
    setTab(next);
    onAutoSave?.();
    requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div ref={cardRef} className="scroll-mt-4">
      <Card className="overflow-hidden p-0" variant="primary">
        <header className="border-b border-border/50 bg-muted/30 px-5 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </header>

        <div className="space-y-4 p-5">
          <Tabs
            value={tab}
            onValueChange={(v) => goToTab(v as GuardianTab)}
            className="space-y-4"
          >
            <TabsList className={`${enrollmentSubTabsListClass} justify-center`}>
              <TabsTrigger
                value="form"
                className={enrollmentSubTabsTriggerClass}
              >
                Formulaire
              </TabsTrigger>
              <TabsTrigger
                value="signatures"
                className={enrollmentSubTabsTriggerClass}
              >
                Signatures
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="mt-0 space-y-4">
              <LegalGuardianCard
                embedded
                parent={parent}
                readOnly={readOnly}
                commissions={commissions}
                commissionsLoading={commissionsLoading}
                onChange={onChange}
              />
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="soft"
                  color="secondary"
                  className={navBtnClass}
                  onClick={() => goToTab("signatures")}
                >
                  Suivant — Signatures
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signatures" className="mt-0 space-y-4">
              <GuardianSignaturesPanel
                fileToken={fileToken}
                email={parent.email}
                readOnly={readOnly}
                guardianLabel={guardianLabel}
                childList={childList}
              />
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="soft"
                  color="secondary"
                  className={navBtnClass}
                  onClick={() => goToTab("form")}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Précédent — Formulaire
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
