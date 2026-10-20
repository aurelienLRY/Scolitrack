"use client";

import { Card } from "@/components/ui";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type HistoryItem = {
  id: string;
  oldStatus: string;
  newStatus: string;
  note?: string | null;
  timestamp: string | Date;
  actor?: { name?: string | null; email?: string | null } | null;
};

const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumis",
  NEED_INFO: "A compléter",
  APPROVED: "Approuvé",
  REJECTED: "Refusé",
};

type Props = {
  history: HistoryItem[];
  className?: string;
};

export default function EnrollmentFileHistory({ history, className }: Props) {
  if (!history?.length) {
    return (
      <Card className={`space-y-1 p-3 text-xs ${className ?? ""}`} variant="primary">
        <h2 className="text-sm font-semibold text-foreground">Historique</h2>
        <p className="text-muted-foreground leading-snug">
          Aucun événement. Les changements de statut apparaîtront ici.
        </p>
      </Card>
    );
  }

  return (
    <Card className={`space-y-2 p-3 ${className ?? ""}`} variant="primary">
      <h2 className="text-sm font-semibold">Historique</h2>
      <ul className="max-h-40 space-y-2 overflow-y-auto">
        {history.map((h) => {
          const ts =
            typeof h.timestamp === "string"
              ? new Date(h.timestamp)
              : h.timestamp;
          return (
            <li
              key={h.id}
              className="border-b border-border/40 pb-1.5 text-xs last:border-0 last:pb-0"
            >
              <p className="font-medium text-sm">
                {statusLabel[h.oldStatus] ?? h.oldStatus} →{" "}
                {statusLabel[h.newStatus] ?? h.newStatus}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {format(ts, "dd MMM yyyy à HH:mm", { locale: fr })}
                {h.actor?.name || h.actor?.email
                  ? ` · ${h.actor.name || h.actor.email}`
                  : ""}
              </p>
              {h.note ? (
                <p className="mt-0.5 text-muted-foreground line-clamp-2">{h.note}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
