import { UserPlus, School, KeyRound, GraduationCap, ScanHeart } from "lucide-react";

import { LucideIcon } from "lucide-react";

interface AdminNavItem {
  label: string;
  href: string;
  description: string[];
  icon: LucideIcon;
}

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Établissement",
    href: "/private/setup-application/establishment",
    description: [
      "Gestion des établissements.",
      "Renseigner les informations de l'établissement.",
      "adresse, téléphone, email, etc.",
    ],
    icon: School,
  },
  {
    label: "Rôles & Privilèges",
    href: "/private/setup-application/roles-privilege",
    description: [
      "Administré les droits d'accès des utilisateurs.",
      "Définissez les différents rôles dans l'établissement et attribué leurs des fonctionnalités différentes.",
    ],
    icon: KeyRound,
  },
  {
    label: "Commission",
    href: "/private/setup-application/commission",
    description: [
      "Enregistrer les commissions de l'établissement.",
      "Les commissions enregistrer permettront d’être affectées aux Parents d'élèves.",
    ],
    icon: ScanHeart,
  },

  {
    label: "Utilisateurs",
    href: "/private/setup-application/users",
    description: [
      "Gestion des utilisateurs.",
      "Créer, modifier, supprimer des utilisateurs.",
    ],
    icon: UserPlus,
  },
  {
    label: "Classes",
    href: "/private/setup-application/classrooms",
    description: [
      "Gestion des classes.",
      "Créer, modifier, supprimer des classes.",
    ],
    icon: GraduationCap,
  },
];
