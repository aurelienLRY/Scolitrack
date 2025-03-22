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
    href: "/private/setup-application/establishment",
    description: [
      "Gestion des établissements.",
      "Renseigner les informations de l'établissement.",
      "adresse, téléphone, email, etc.",
    ],
    icon: FaSchool,
  },
  {
    label: "Rôles & Privilèges",
    href: "/private/setup-application/roles-privilege",
    description: [
      "Administré les droits d'accès des utilisateurs.",
      "Définissez les différents rôles dans l'établissement et attribué leurs des fonctionnalités différentes.",
    ],
    icon: RiChatPrivateLine,
  },

  {
    label: "Utilisateurs",
    href: "/private/setup-application/users",
    description: [
      "Gestion des utilisateurs.",
      "Créer, modifier, supprimer des utilisateurs.",
    ],
    icon: RiAdminLine,
  },
  {
    label: "Classes",
    href: "/private/setup-application/classes",
    description: [
      "Gestion des classes.",
      "Créer, modifier, supprimer des classes.",
    ],
    icon: IoSchoolOutline,
  },
];
