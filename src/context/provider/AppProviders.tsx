import { ReactNode } from "react";
import { RolesPrivilegesProvider } from "@/context/provider/RolesPrivilegesProvider";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Composant combinant tous les providers de l'application
 * Facilite l'initialisation des contextes et stores
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <RolesPrivilegesProvider>
      {/* Autres providers peuvent être ajoutés ici */}
      {children}
    </RolesPrivilegesProvider>
  );
}

export default AppProviders;
