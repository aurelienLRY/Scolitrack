# Composant Sidebar pour Scolitrack

Ce dossier contient un composant de barre latérale (sidebar) responsive et optimisé pour l'application Scolitrack.

## Table des matières

1. [Fonctionnalités](#fonctionnalités)
2. [Structure des fichiers](#structure-des-fichiers)
3. [Utilisation de base](#utilisation-de-base)
4. [Gestion de l'état](#gestion-de-létat)
5. [Configuration des éléments de navigation](#configuration-des-éléments-de-navigation)
6. [Implémentation de contrôles d'accès par rôle et privilège](#implémentation-de-contrôles-daccès-par-rôle-et-privilège)
7. [Optimisations de performance](#optimisations-de-performance)
8. [Personnalisation](#personnalisation)

## Fonctionnalités

- **Responsive** : Affichage en barre latérale sur desktop et menu hamburger sur mobile
- **Mode rétractable** : Possibilité de réduire la sidebar pour n'afficher que les icônes
- **État persistant** : L'état d'ouverture/fermeture est conservé entre les navigations
- **Optimisé** : Utilisation de memo et autres techniques pour limiter les re-rendus
- **Personnalisable** : Facile à étendre pour ajouter des éléments de navigation

## Structure des fichiers

- `Sidebar.tsx` : Composant principal de la sidebar
- `SidebarLayout.tsx` : Composant wrapper qui combine la sidebar et le contenu
- `index.ts` : Points d'entrée du module
- `README.md` : Documentation (ce fichier)

## Utilisation de base

Pour utiliser la sidebar dans une page, importez le composant `SidebarLayout` et utilisez-le comme wrapper autour de votre contenu :

```tsx
import { SidebarLayout } from "@/components/layout/sidebar";

export default function MaPage() {
  return (
    <SidebarLayout>
      <h1>Contenu de ma page</h1>
      <p>Autres éléments...</p>
    </SidebarLayout>
  );
}
```

## Gestion de l'état

La sidebar utilise un contexte React pour gérer son état et assurer sa persistance entre les navigations :

- **SidebarContext** : Fournit l'état `isCollapsed` et sa fonction setter à tous les composants enfants
- **SidebarProvider** : Gère la persistence de l'état via localStorage
- **useSidebar** : Hook personnalisé pour accéder au contexte

Pour accéder à l'état de la sidebar depuis n'importe quel composant :

```tsx
import { useSidebar } from "@/components/layout/sidebar";

function MonComposant() {
  const { isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <button onClick={() => setIsCollapsed(!isCollapsed)}>
      {isCollapsed ? "Développer" : "Réduire"}
    </button>
  );
}
```

## Configuration des éléments de navigation

Les éléments de navigation sont définis comme un tableau d'objets avec la structure suivante :

```tsx
interface NavItem {
  title: string; // Texte affiché
  href: string; // URL de destination
  icon: ReactNode; // Icône (composant React)
}
```

Pour personnaliser les éléments de navigation, créez votre propre tableau et passez-le au composant `SidebarLayout` :

```tsx
import { SidebarLayout } from "@/components/layout/sidebar";
import { FiHome, FiUser, FiSettings } from "react-icons/fi";

const mesElements = [
  {
    title: "Accueil",
    href: "/",
    icon: <FiHome size={20} />,
  },
  {
    title: "Profil",
    href: "/profile",
    icon: <FiUser size={20} />,
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: <FiSettings size={20} />,
  },
];

export default function MaPage() {
  return (
    <SidebarLayout navItems={mesElements}>
      <h1>Contenu de ma page</h1>
    </SidebarLayout>
  );
}
```

## Implémentation de contrôles d'accès par rôle et privilège

Pour adapter la sidebar afin de n'afficher que les éléments auxquels l'utilisateur a accès en fonction de son rôle ou de ses privilèges, voici comment procéder :

### 1. Étendre l'interface NavItem

```tsx
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[]; // Rôles autorisés à voir cet élément
  privileges?: string[]; // Privilèges requis pour voir cet élément
}
```

### 2. Créer une fonction de filtrage

```tsx
// Fonction pour filtrer les éléments de navigation selon les rôles et privilèges
function filterNavItems(
  items: NavItem[],
  userRoles: string[],
  userPrivileges: string[]
): NavItem[] {
  return items.filter((item) => {
    // Si aucune restriction n'est définie, l'élément est visible pour tous
    if (!item.roles && !item.privileges) return true;

    // Vérifier si l'utilisateur a au moins un des rôles requis
    const hasRequiredRole =
      !item.roles || item.roles.some((role) => userRoles.includes(role));

    // Vérifier si l'utilisateur a tous les privilèges requis
    const hasRequiredPrivileges =
      !item.privileges ||
      item.privileges.every((priv) => userPrivileges.includes(priv));

    // L'élément est visible si les deux conditions sont respectées
    return hasRequiredRole && hasRequiredPrivileges;
  });
}
```

### 3. Utiliser le filtrage dans votre page

```tsx
import { SidebarLayout } from "@/components/layout/sidebar";
import { useSession } from "next-auth/react";
import { allNavItems } from "@/config/navigation";

export default function ProtectedPage() {
  const { data: session } = useSession();

  // Récupérer les rôles et privilèges de l'utilisateur
  const userRoles = session?.user?.roles || [];
  const userPrivileges = session?.user?.privileges || [];

  // Filtrer les éléments de navigation
  const filteredNavItems = filterNavItems(
    allNavItems,
    userRoles,
    userPrivileges
  );

  return (
    <SidebarLayout navItems={filteredNavItems}>
      <h1>Contenu protégé</h1>
    </SidebarLayout>
  );
}
```

### 4. Exemple de configuration d'éléments avec rôles et privilèges

```tsx
// Dans un fichier de configuration comme src/config/navigation.ts
import { FiHome, FiUsers, FiSettings, FiLock } from "react-icons/fi";

export const allNavItems = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: <FiHome size={20} />,
    // Accessible à tous (pas de restrictions)
  },
  {
    title: "Gestion des utilisateurs",
    href: "/users",
    icon: <FiUsers size={20} />,
    roles: ["ADMIN", "MANAGER"], // Uniquement visible pour les admins et managers
  },
  {
    title: "Configurations système",
    href: "/system",
    icon: <FiSettings size={20} />,
    roles: ["ADMIN"], // Uniquement pour les admins
    privileges: ["SYSTEM_CONFIG"], // Avec le privilège de configuration système
  },
  {
    title: "Sécurité",
    href: "/security",
    icon: <FiLock size={20} />,
    privileges: ["SECURITY_ACCESS"], // Uniquement visible pour ceux avec le privilège sécurité
  },
];
```

### 5. Implémentation alternative avec HOC

Vous pouvez également créer un HOC (Higher-Order Component) pour simplifier l'utilisation :

```tsx
export function withRoleBasedNavigation(Component) {
  return function WithRoleBasedNavigation(props) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPrivileges = session?.user?.privileges || [];

    const filteredNavItems = filterNavItems(
      allNavItems,
      userRoles,
      userPrivileges
    );

    return <Component {...props} navItems={filteredNavItems} />;
  };
}

// Utilisation
const ProtectedSidebarLayout = withRoleBasedNavigation(SidebarLayout);

// Dans votre page
export default function AdminPage() {
  return (
    <ProtectedSidebarLayout>
      <h1>Page d'administration</h1>
    </ProtectedSidebarLayout>
  );
}
```

## Optimisations de performance

La sidebar inclut plusieurs optimisations pour éviter les re-rendus inutiles :

1. **Mémoisation des composants** avec `React.memo`
2. **Extraction des sous-composants** comme `NavItemLink` pour limiter la portée des re-rendus
3. **Utilisation de `useCallback`** pour les gestionnaires d'événements
4. **Contexte React** pour partager l'état sans passer de props en cascade
5. **localStorage** pour la persistance sans requêtes serveur

## Personnalisation

### Styles

Pour personnaliser l'apparence de la sidebar, vous pouvez passer une classe via la prop `className` :

```tsx
<SidebarLayout className="bg-custom-color">{/* Contenu */}</SidebarLayout>
```

Les classes par défaut sont basées sur Tailwind CSS et peuvent être modifiées directement dans les fichiers source.

### Comportement

Pour changer le comportement par défaut (par exemple, que la sidebar soit réduite par défaut), modifiez la valeur par défaut dans le contexte :

```tsx
// Dans SidebarLayout.tsx
const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : true; // true au lieu de false
  }
  return true; // true au lieu de false
});
```
