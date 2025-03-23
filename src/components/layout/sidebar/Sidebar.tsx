"use client";
import React, { useState, useEffect, memo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FiHome,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { IoSettingsSharp } from "react-icons/io5";

import { Tooltip } from "@/components/shared/tooltip";
import Authorization from "@/components/auth/Authorization";
// Types
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  privileges?: string[];
}

interface SidebarProps {
  items: NavItem[];
  className?: string;
  onCollapseChange?: (collapsed: boolean) => void;
  initialCollapsed?: boolean;
}

// Composant NavItem optimisé
const NavItemLink = memo(
  ({
    item,
    isActive,
    isCollapsed,
    onClick,
  }: {
    item: NavItem;
    isActive: boolean;
    isCollapsed: boolean;
    onClick?: () => void;
  }) => {
    if (item.privileges) {
      return (
        <Authorization privileges={item.privileges}>
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors",
              isCollapsed && "justify-center",
              isActive ? "bg-accent text-white" : "hover:text-accent text-text"
            )}
            title={isCollapsed ? item.title : undefined}
            onClick={onClick}
          >
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              {item.icon}
            </div>
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        </Authorization>
      );
    }
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors",
          isCollapsed && "justify-center",
          isActive ? "bg-accent text-white" : "hover:text-accent text-text"
        )}
        title={isCollapsed ? item.title : undefined}
        onClick={onClick}
      >
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {item.icon}
        </div>
        {!isCollapsed && <span>{item.title}</span>}
      </Link>
    );
  }
);

NavItemLink.displayName = "NavItemLink";

function SidebarComponent({
  items = defaultItems,
  className,
  onCollapseChange,
  initialCollapsed = false,
}: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const toggleCollapsed = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  }, [isCollapsed, onCollapseChange]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Mise à jour lorsque initialCollapsed change
  useEffect(() => {
    setIsCollapsed(initialCollapsed);
  }, [initialCollapsed]);

  // Notification du parent lors du montage initial
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  return (
    <>
      {/* Mobile Header with Toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-background border-b border-primary/10">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md hover:bg-primary/10 transition-colors"
          aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <div className="text-2xl font-bold">
          Scoli<span className="text-accent">Track</span>
        </div>
      </div>

      {/* Mobile sidebar (top) */}
      <div
        className={cn(
          "lg:hidden fixed top-[73px] left-0 right-0 h-auto bg-background z-50 border-b border-primary/10 shadow-md transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <nav className="flex flex-col p-4 space-y-2">
          {items.map((item, index) => (
            <NavItemLink
              key={index}
              item={item}
              isActive={pathname === item.href}
              isCollapsed={false}
              onClick={closeMobileMenu}
            />
          ))}
        </nav>
      </div>

      {/* Desktop sidebar (left) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col min-h-full bg-background/20 border-r border-primary/10 transition-all duration-300",
          isCollapsed ? "w-16" : "w-56",
          className
        )}
      >
        <div
          className={cn(
            "flex items-center p-4 border-b border-primary/10",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && (
            <div className="text-2xl font-bold">
              Scoli<span className="text-accent">Track</span>
            </div>
          )}
          <Tooltip
            content={
              isCollapsed ? "Développer la sidebar" : "Réduire la sidebar"
            }
            position="right"
          >
            <button
              onClick={toggleCollapsed}
              className="p-1 rounded-md hover:bg-primary/10 transition-colors"
              aria-label={
                isCollapsed ? "Développer la sidebar" : "Réduire la sidebar"
              }
            >
              {isCollapsed ? (
                <FiChevronRight size={20} />
              ) : (
                <FiChevronLeft size={20} />
              )}
            </button>
          </Tooltip>
        </div>
        <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
          {items.map((item, index) => (
            <NavItemLink
              key={index}
              item={item}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

// Mémoisation du composant Sidebar pour éviter les re-rendus inutiles
export const Sidebar = memo(SidebarComponent);

// Éléments de navigation par défaut
export const defaultItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/private/dashboard",
    icon: <FiHome size={20} />,
  },

  {
    title: "Paramètres",
    href: "/private/setup-application",
    icon: <IoSettingsSharp size={20} />,
    privileges: ["SETUP_APPLICATION"],
  },
];

export default Sidebar;
