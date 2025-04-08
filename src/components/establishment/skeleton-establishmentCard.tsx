import { Card } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Link } from "lucide-react";

const ICONS_SIZE = 4;

export default function SkeletonEstablishmentCard() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="p-6 flex flex-col md:flex-row gap-4 md:gap-12 items-center md:items-start overflow-auto max-w-fit"
        variant="primary"
      >
        {/* Zone du logo */}
        <div className="my-auto">
          <Skeleton className="w-[150px] h-[150px] rounded-md" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-12 justify-center items-center">
          {/* Informations de l'établissement */}
          <div className="flex flex-col gap-2 items-center md:items-start">
            <Skeleton className="h-8 w-48 mb-2" />

            <div className="flex items-center gap-2">
              <MapPin
                className={`w-${ICONS_SIZE} h-${ICONS_SIZE} text-muted-foreground`}
              />
              <div>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-32 mt-1" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail
                className={`w-${ICONS_SIZE} h-${ICONS_SIZE} text-muted-foreground`}
              />
              <Skeleton className="h-5 w-36" />
            </div>

            <div className="flex items-center gap-2">
              <Phone
                className={`w-${ICONS_SIZE} h-${ICONS_SIZE} text-muted-foreground`}
              />
              <Skeleton className="h-5 w-32" />
            </div>

            <div className="flex items-center gap-2">
              <Link
                className={`w-${ICONS_SIZE} h-${ICONS_SIZE} text-muted-foreground`}
              />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>

          {/* Informations du directeur */}
          <div className="flex flex-col gap-2">
            <div className="bg-gray-800 p-2 rounded-md flex flex-col gap-2 min-w-fit overflow-hidden">
              <Skeleton className="h-6 w-40 mx-auto mb-2" />

              <div className="flex gap-4">
                <Skeleton className="w-[75px] h-[75px] rounded-full" />

                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-5 w-36" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function EmptyEstablishmentCardSkeleton() {
  return (
    <Card className="p-8">
      <div className="text-center mb-6">
        <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full" />
        <Skeleton className="h-7 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-80 mx-auto mb-2" />
        <Skeleton className="h-5 w-72 mx-auto mb-6" />
        <Skeleton className="h-12 w-64 mx-auto rounded-md" />
      </div>
    </Card>
  );
}
