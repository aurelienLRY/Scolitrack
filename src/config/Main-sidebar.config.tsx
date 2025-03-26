import { LayoutDashboard, Settings } from "lucide-react";

export type TSideBarItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  privilege?: string;
};

/**
 * Sidebar links
 * @description This is the sidebar links for the application
 * @returns {SidebarLink[]}
 */
export const sidebarItem: TSideBarItem[] = [
  {
    label: "Tableau de bord",
    href: "/private/dashboard",
    icon: <LayoutDashboard />,
  },

  {
    label: "Paramètres",
    href: "/private/setup-application",
    icon: <Settings />,
    privilege: "SETUP_APPLICATION",
  },
];
