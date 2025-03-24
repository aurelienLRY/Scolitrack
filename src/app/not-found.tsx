import { buttonVariants } from "@/components/shared/button";
import Link from "next/link";

/**
 * Not found page
 * @returns
 */
export default function NotFound() {
  return (
    <section className="flex h-[calc(100vh-170px)] w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="text-8xl">🧐</span>
        <h1>Page non trouvée</h1>
        <p className=" text-gray-500">
          La page que vous cherchez n&apos;existe pas.
        </p>
        <div className="flex gap-4">
          <Link href="/" className={buttonVariants({ variant: "accent" })}>
            Retour à la page d&apos;accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
