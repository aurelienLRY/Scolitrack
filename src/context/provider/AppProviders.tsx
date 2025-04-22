/**
 * Composant combinant tous les providers de l'application
 * Facilite l'initialisation des contextes et stores
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Autres providers peuvent être ajoutés ici */}
      {children}
    </>
  );
}

export default AppProviders;
