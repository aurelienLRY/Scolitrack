# Dossier `components/`

## Utilisation

Ce dossier contient tous les composants réutilisables de l'application, organisés par catégorie.

## Conventions de nommage

- Noms de dossiers : `kebab-case`
- Noms de composants : `PascalCase`
- Extensions : `.tsx` pour les composants avec TypeScript

## Structure

```plaintext
components/
├── auth/           # Composants liés à l'authentification
├── layout/         # Composants de mise en page (header, sidebar, footer)
├── notification/   # Composants de notification et alertes
├── roles-privileges/ # Composants de gestion des rôles et privilèges
├── shared/         # Composants partagés et utilitaires
├── ui/            # Composants UI de base (boutons, inputs, etc.)
└── users/         # Composants liés à la gestion des utilisateurs
```

## Bonnes pratiques

1. **Organisation**

   - Chaque composant doit être dans son propre fichier
   - Les composants doivent être modulaires et réutilisables
   - Grouper les composants liés dans des sous-dossiers appropriés

2. **Documentation**

   - Chaque dossier majeur doit avoir son propre `README.md`
   - Documenter les props et l'utilisation des composants
   - Inclure des exemples d'utilisation

3. **Typage**

   - Utiliser TypeScript pour le typage des props
   - Exporter les interfaces de props si elles sont réutilisées
   - Utiliser des types stricts plutôt que `any`

4. **Styles**
   - Utiliser Tailwind CSS pour le styling
   - Suivre les conventions de design system
   - Maintenir la cohérence visuelle

## Exemple de composant

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  children,
}: ButtonProps) => {
  return (
    <button
      className={cn("rounded-md font-medium", {
        "bg-primary text-white": variant === "primary",
        "bg-secondary text-gray-900": variant === "secondary",
        "bg-accent text-white": variant === "accent",
        "px-2 py-1 text-sm": size === "sm",
        "px-4 py-2": size === "md",
        "px-6 py-3 text-lg": size === "lg",
      })}
    >
      {children}
    </button>
  );
};
```
