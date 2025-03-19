import { RiAdminLine } from "react-icons/ri";
import { IoSchoolOutline } from "react-icons/io5";

import { RiChatPrivateLine } from "react-icons/ri";
import { FaSchool } from "react-icons/fa";

import { IconType } from "react-icons/lib";

interface AdminNavItem {
  label: string;
  href: string;
  description: string[];
  icon: IconType;
}

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Établissement",
    href: "/private/admin/establishment",
    description: [
      "Gestion des établissements.",
      "Renseigner les informations de l'établissement.",
      "adresse, téléphone, email, etc.",
    ],
    icon: FaSchool,
  },
  {
    label: "Rôles",
    href: "/private/admin/roles",
    description: [
      "Gestion des rôles.",
      "Les rôles sont utilisés pour gérer les permissions des utilisateurs.",
      "Directeur, enseignant, élève, parent, etc.",
    ],
    icon: RiAdminLine,
  },
  {
    label: "Privilèges",
    href: "/private/admin/privilege",
    description: [
      "Gestion des privilèges.",
      "Les privilèges permettent d'autoriser ou non des actions aux différents rôles.",
      "Exemple: les professeurs peuvent voir les informations des élèves.",
    ],
    icon: RiChatPrivateLine,
  },
  {
    label: "Utilisateurs",
    href: "/private/admin/users",
    description: [
      "Gestion des utilisateurs.",
      "Les utilisateurs sont les personnes qui utilisent l'application.",
    ],
    icon: RiAdminLine,
  },
  {
    label: "Classes",
    href: "/private/admin/classes",
    description: [
      "Gestion des classes.",
      "Créer, modifier, supprimer des classes.",
    ],
    icon: IoSchoolOutline,
  },
];
