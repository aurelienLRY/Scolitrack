import { 
  Calendar, 
  FileText, 
} from "lucide-react";

import { LucideIcon } from "lucide-react";

interface EnrollmentNavItem {
  label: string;
  href: string;
  description: string[];
  icon: LucideIcon;
}

export const enrollmentNavItems: EnrollmentNavItem[] = [
  {
    label: "Campagnes",
    href: "/private/enrollment/campaign",
    description: [
      "Vue d'ensemble des campagnes d'inscription.",
      "Envoyer les dossiers d'inscription à l'ensemble des élèves en un clic.",
      "Suivre l'avancement global.",
    ],
    icon: Calendar,
  },
  {
    label: "Dossiers",
    href: "/private/enrollment/files",
    description: [
      "Gestion de tous les dossiers d'inscription.",
      "Consulter, modifier, valider les dossiers.",
      "Créer des dossiers manuellement (email).",
      "Filtrer et rechercher les dossiers.",
    ],
    icon: FileText,
  },
];
