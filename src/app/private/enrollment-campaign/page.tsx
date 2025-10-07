import { CardFluo } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UserPlus, LucideIcon } from "lucide-react";
import Link from "next/link";

export default function ManageInscription() {
 
  return (
    <>
    <section className="flex flex-col gap-2 mb-10">
        <div className="">
        <h2 className="">Inscription</h2>
        <p className="text-sm text-gray-500">Cette section permet de gérer les campagnes d&apos;inscription.</p>
        </div>
        <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold">Inscription en cours d&apos;instruction </h3>
            <p className="text-sm text-gray-500">...</p>
        </div>
    </section>
    <section className="flex justify-center items-center gap-10">

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
      {InscriptionNavItems.map((item, index) => (
        <div
          key={index}
          className="min-w-[250px] w-full aspect-square max-w-[300px]"
        >
        <Link href={item.href}>
          <CardFluo
            className="p-5  flex flex-col justify-center group"
            variant="primary"
          >
            <item.icon className="text-4xl group-hover:text-accent transition-all duration-300 ease-in-out mb-3" />
            <h2 className="text-2xl font-bold">{item.label}</h2>
            {item.description.map((description, index) => (
              <p
                key={index}
                className={cn(
                  index === 0
                    ? " font-bold "
                    : "mt-0.5 text-sm italic text-gray-400"
                )}
              >
                {description}
              </p>
            ))}
          </CardFluo>
          </Link>
        </div>
      ))}
    </div>
  </section>
  </>
  );
}

ManageInscription.displayName = "ManageInscription";



interface InscriptionNavItem {
    label: string;
    href: string;
    description: string[];
    icon: LucideIcon;
  }
  

const  InscriptionNavItems: InscriptionNavItem[] = [
  {
    label: "Campagne d'inscription",
    href: "/private/inscription/create-campaign",
    description: [
        "Démarrer une campagne d'inscription",
    "Envoyez à chaque élève un lien de connexion pour l'inscription.",
    ],
    icon: UserPlus,
  },
  {
    label: "Envoyer dossier d'inscription",
    href: "/private/inscription/create-campaign",
    description: [
        "Envoyer un dossier d'inscription.",
    "Envoyer un dossier d'inscription à chaque élève.",  
    ],
    icon: UserPlus,
  },
];
