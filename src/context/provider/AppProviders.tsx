import { RolesPrivilegesProvider } from "@/context/provider/RolesPrivilegesProvider";

/**
 * Composant combinant tous les providers de l'application
 * Facilite l'initialisation des contextes et stores
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RolesPrivilegesProvider>
      {/* Autres providers peuvent être ajoutés ici */}
      {children}
    </RolesPrivilegesProvider>
  );
}

export default AppProviders;
