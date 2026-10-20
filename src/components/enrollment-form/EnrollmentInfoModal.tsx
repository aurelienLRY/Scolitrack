"use client";

import Modal, { ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui";
import type { EnrollmentInfoDoc } from "@/config/enrollment-info-docs.config";

interface EnrollmentInfoModalProps {
  doc: EnrollmentInfoDoc | null;
  open: boolean;
  onClose: () => void;
  /** Si true : bouton « J'ai lu » pour débloquer la signature */
  requireAck?: boolean;
  onAcknowledge?: () => void;
}

export default function EnrollmentInfoModal({
  doc,
  open,
  onClose,
  requireAck = false,
  onAcknowledge,
}: EnrollmentInfoModalProps) {
  if (!doc) return null;

  const handleAck = () => {
    onAcknowledge?.();
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={doc.title}
      description={doc.subtitle}
      size="xl"
      className="max-w-2xl"
    >
      <div className="space-y-5 pr-1">
        {doc.sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              {section.title}
            </h3>
            {section.paragraphs?.map((p) => (
              <p
                key={p.slice(0, 48)}
                className="text-sm leading-relaxed text-muted-foreground"
              >
                {p}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                {section.bullets.map((b) => (
                  <li key={b.slice(0, 48)}>{b}</li>
                ))}
              </ul>
            ) : null}
            {section.note ? (
              <p className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs leading-relaxed text-foreground/90">
                {section.note}
              </p>
            ) : null}
          </section>
        ))}
      </div>

      <ModalFooter className="mt-4 border-t border-border/50 pt-4">
        {requireAck ? (
          <Button
            type="button"
            color="secondary"
            className="bg-white text-slate-900 hover:bg-white/90 dark:bg-white dark:text-slate-900"
            onClick={handleAck}
          >
            J&apos;ai lu — continuer
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            color="secondary"
            className="bg-white text-slate-900 dark:bg-white dark:text-slate-900"
            onClick={onClose}
          >
            Fermer
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
