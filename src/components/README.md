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
├── ui/          # Composants UI de base
├── layout/      # Composants de mise en page
└── shared/      # Composants partagés
```

## Exemple

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export const Button = ({ variant = "primary", children }: ButtonProps) => {
  return <button className={`btn btn-${variant}`}>{children}</button>;
};
```

## Bonnes pratiques

- Chaque composant doit être dans son propre fichier
- Les composants doivent être modulaires et réutilisables
- Utiliser TypeScript pour le typage des props
- Documenter les props et l'utilisation des composants
