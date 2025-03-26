# Composant Sidebar pour Scolitrack

Ce dossier contient un composant de barre latérale (sidebar) responsive et optimisé pour l'application Scolitrack.

## Table des matières

1. [Fonctionnalités](#fonctionnalités)
2. [Structure des fichiers](#structure-des-fichiers)
3. [Utilisation de base](#utilisation-de-base)
4. [Configuration des éléments de navigation](#configuration-des-éléments-de-navigation)
5. [Gestion des autorisations](#gestion-des-autorisations)
6. [Personnalisation](#personnalisation)

## Fonctionnalités

- **Responsive** : Affichage en barre latérale sur desktop et menu hamburger sur mobile
- **Mode rétractable** : Possibilité de réduire la sidebar pour n'afficher que les icônes
- **Autorisations** : Intégration avec le système d'autorisations pour le contrôle d'accès
- **Menu utilisateur** : Intégration du menu utilisateur en bas de la sidebar
- **Logo personnalisé** : Affichage du logo Scolitrack avec style personnalisé

## Structure des fichiers

- `Main-sidebar.tsx` : Composant principal de la sidebar
- `Main-sidebar.config.ts` : Configuration des éléments de navigation
- `README.md` : Documentation (ce fichier)

## Utilisation de base

Pour utiliser la sidebar dans une page, importez le composant `MainSidebar` :

```tsx
import MainSidebar from "@/components/layout/sidebar/Main-sidebar";

export default function MaPage() {
  return (
    <div className="flex">
      <MainSidebar />
      <main className="flex-1">
        <h1>Contenu de ma page</h1>
        <p>Autres éléments...</p>
      </main>
    </div>
  );
}
```

## Configuration des éléments de navigation

Les éléments de navigation sont définis dans `Main-sidebar.config.ts` avec la structure suivante :

```tsx
interface TSideBarItem {
  label: string; // Texte affiché
  href: string; // URL de destination
  icon: ReactNode; // Icône (composant React)
  privilege: string; // Privilège requis pour l'accès
}
```

Exemple de configuration :

```tsx
import { Users, Settings } from "lucide-react";

export const sidebarItem: TSideBarItem[] = [
  {
    label: "Utilisateurs",
    href: "/users",
    icon: <Users size={20} />,
    privilege: "VIEW_USERS",
  },
  {
    label: "Paramètres",
    href: "/settings",
    icon: <Settings size={20} />,
    privilege: "MANAGE_SETTINGS",
  },
];
```

## Gestion des autorisations

La sidebar utilise le composant `Authorized` pour gérer les accès aux éléments de navigation :

```tsx
const CustomSidebar = ({ navItem }: { navItem: TSideBarItem }) => {
  return (
    <Authorized privilege={navItem.privilege}>
      <SidebarLink
        link={{
          label: navItem.label,
          href: navItem.href,
          icon: navItem.icon,
        }}
      />
    </Authorized>
  );
};
```

Chaque élément de navigation est enveloppé dans un composant `Authorized` qui vérifie si l'utilisateur possède le privilège requis avant d'afficher le lien.

## Personnalisation

### Logo et Style

La sidebar inclut un logo personnalisé avec le texte "Scolitrack" :

```tsx
<div className="flex items-center gap-2 overflow-x-hidden">
  <Image src="/img/Logo_Scolitrack.svg" alt="logo" width={25} height={25} />
  <p className="font-bold">
    Scoli<span className="text-accent">Track</span>
  </p>
</div>
```

### Menu Utilisateur

Le menu utilisateur est intégré en bas de la sidebar :

```tsx
<div className="flex justify-center items-center">
  <UserMenu />
</div>
```

### Styles

La sidebar utilise Tailwind CSS pour le style. Les classes principales incluent :

- `justify-between gap-10` pour l'espacement vertical
- `flex flex-col gap-8` pour l'organisation des éléments
- `bg-primary/30` pour la ligne de séparation
