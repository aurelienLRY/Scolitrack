import { ButtonLink } from "@/components/shared/button";

export default function Unauthorized() {
  return (
    <section className="flex w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="text-8xl">🧐</span>
        <h1>Accès refusé</h1>
        <p className=" text-gray-500">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette
          page.
        </p>
        <div className="flex gap-4">
          <ButtonLink href="/" variant="accent">
            Retour à la page d&apos;accueil
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
