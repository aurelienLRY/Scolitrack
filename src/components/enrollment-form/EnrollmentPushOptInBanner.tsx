"use client";

import { useSession } from "next-auth/react";
import { Bell, BellOff, Mail } from "lucide-react";
import { Button } from "@/components/ui";
import { useNotification } from "@/hooks/useNotification";

function GuestEmailHint() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-dashed border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>
        Les mises à jour de votre dossier (réception, acceptation, demandes de
        complément) vous sont envoyées par <strong>email</strong>. Si vous
        disposez d&apos;un compte sur l&apos;application, connectez-vous pour
        activer aussi les notifications navigateur.
      </p>
    </div>
  );
}

function AuthenticatedPushOptIn() {
  const { isSubscribed, isLoading, subscribe, unsubscribe } = useNotification();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs">
      <div className="flex items-start gap-2 text-muted-foreground">
        {isSubscribed ? (
          <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground" />
        ) : (
          <BellOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        )}
        <p>
          {isSubscribed
            ? "Notifications activées : vous serez alerté(e) des étapes suivantes (validation, complément, etc.)."
            : "Activez les notifications pour être alerté(e) dès qu’une décision est prise sur votre dossier (en plus des emails)."}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        color="secondary"
        disabled={isLoading}
        onClick={() => (isSubscribed ? unsubscribe() : subscribe())}
      >
        {isSubscribed ? "Désactiver" : "Activer les notifications"}
      </Button>
    </div>
  );
}

/**
 * Opt-in push sur le parcours public.
 * Uniquement si une session User est active (PushSubscription exige un userId).
 * Sinon, rappel que les infos passent par email.
 */
export default function EnrollmentPushOptInBanner() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (!session?.user) return <GuestEmailHint />;
  return <AuthenticatedPushOptIn />;
}
