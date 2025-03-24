"use client";
import React, {
  useState,
  useCallback,
  memo,
  useEffect,
  createContext,
  useContext,
} from "react";
import { Sidebar, defaultItems } from "./Sidebar";
import { cn } from "@/lib/utils";

interface SidebarLayoutProps {
  children: React.ReactNode;
  navItems?: typeof defaultItems;
  className?: string;
}

// Créer un contexte pour partager l'état de la sidebar
interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte de la sidebar
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error(
      "useSidebar doit être utilisé à l'intérieur d'un SidebarProvider"
    );
  }
  return context;
};

// Provider pour le contexte de la sidebar
export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Initialiser avec la valeur stockée dans localStorage ou false par défaut
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Mettre à jour localStorage quand isCollapsed change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Optimisation: extraire le contenu principal pour éviter les re-rendus inutiles
const MainContent = memo(
  ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
    isCollapsed: boolean;
  }) => {
    return (
      <div
        className={cn(
          "flex-1 p-4 lg:p-6 overflow-auto transition-all duration-300",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

MainContent.displayName = "MainContent";

function SidebarLayoutComponent({
  children,
  navItems = defaultItems,
  className,
}: SidebarLayoutProps) {
  // Utiliser le contexte pour l'état de collapse
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const handleCollapseChange = useCallback(
    (collapsed: boolean) => {
      setIsCollapsed(collapsed);
    },
    [setIsCollapsed]
  );

  return (
    <div className="min-h-[calc(100vh-170px)]  flex flex-col lg:flex-row">
      {/* Sidebar component with collapse state handling */}
      <Sidebar
        items={navItems}
        onCollapseChange={handleCollapseChange}
        initialCollapsed={isCollapsed}
      />

      {/* Main content */}
      <MainContent isCollapsed={isCollapsed} className={className}>
        {children}
      </MainContent>
    </div>
  );
}

// Mémoisation du composant SidebarLayout
export const SidebarLayout = memo(SidebarLayoutComponent);

// Composant wrapper qui inclut le provider
export default function SidebarLayoutWithProvider(props: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <SidebarLayout {...props} />
    </SidebarProvider>
  );
}
