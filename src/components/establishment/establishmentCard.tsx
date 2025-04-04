import { Establishment, User } from "@prisma/client";
import { Card, Button } from "@/components/ui";
import { School, MapPin, Mail, Phone, Link } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type EstablishmentWithAdmin = Establishment & {
  admin: User;
};
const ICONS_SIZE = 4;

export default function EstablishmentCard({
  establishment,
  handleNewEstablishment,
}: {
  establishment?: EstablishmentWithAdmin;
  handleNewEstablishment: () => void;
}) {
  return !establishment ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8" variant="primary">
        <div className="text-center mb-6">
          <School className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-semibold mb-2">
            Aucun établissement configuré
          </p>
          <p className="text-gray-500 mb-6">
            Configurez les informations de votre établissement pour
            personnaliser vos documents.
          </p>
          <Button
            onClick={handleNewEstablishment}
            variant="solid"
            color="success"
            size="lg"
          >
            Configurer l&apos;établissement
          </Button>
        </div>
      </Card>
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card
        className="p-6 flex flex-col md:flex-row gap-4 md:gap-12 items-center md:items-start overflow-auto max-w-fit"
        variant="primary"
      >
        <div className={cn("my-auto", !establishment.logoUrl && "opacity-50")}>
          <Image
            src={establishment.logoUrl || "/img/Logo_Scolitrack.png"}
            alt={`Logo de ${establishment.name}`}
            width={150}
            height={150}
            className="object-cover  aspect-square"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-12 justify-center items-center">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <h2 className="">{establishment.name}</h2>
            <div className="flex items-center gap-2">
              <MapPin className={`w-${ICONS_SIZE} h-${ICONS_SIZE}`} />
              <p className="text-base">
                {establishment.address},
                <br />
                {establishment.postalCode} {establishment.city}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className={`w-${ICONS_SIZE} h-${ICONS_SIZE}`} />
              <p className="text-base">
                {establishment.email && (
                  <span className="block">{establishment.email}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Phone className={`w-${ICONS_SIZE} h-${ICONS_SIZE}`} />
              <p>
                {establishment.phone && (
                  <span className="block">{establishment.phone}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link className={`w-${ICONS_SIZE} h-${ICONS_SIZE}`} />
              <p>
                {establishment.website && (
                  <a
                    href={establishment.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline"
                  >
                    site web
                  </a>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {establishment.admin && (
              <div className=" bg-background p-4 rounded-md flex flex-col gap-2 min-w-fit overflow-hidden">
                <h3 className="text-xl text-center">Directeur | Directrice</h3>
                <div className="flex  gap-4">
                  <Image
                    src={establishment.admin.image || "/icons/my-account.png"}
                    alt={`Logo de ${establishment.admin.name}`}
                    width={75}
                    height={75}
                    className="object-cover  aspect-square rounded-full bg-secondary/10"
                  />

                  <div>
                    <p className="text-base ">{establishment.admin.name}</p>
                    <p className="text-base">{establishment.admin.email}</p>
                    {/* <p
                      className={cn(
                        "text-base",
                        !establishment.admin.phone &&
                          "font-light italic text-sm opacity-50"
                      )}
                    >
                      {establishment.admin.phone || "Téléphone manquant"}
                    </p>*/}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
