import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// Fonction pour formater les dates
export const formatDate = (date: string | Date) => {
  return format(new Date(date), "dd MMMM yyyy", { locale: fr });
};
