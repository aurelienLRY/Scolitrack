import { ButtonLink } from "@/components/shared/button";
export default function NotFound() {
  return (
    <section className="flex h-[calc(100vh-100px)] w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="text-8xl">🧐</span>
        <h1>Page non trouvée</h1>
        <p className=" text-gray-500">
          La page que vous cherchez n&apos;existe pas.
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
