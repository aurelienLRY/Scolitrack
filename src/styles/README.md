# Dossier `styles/`

## Utilisation

Ce dossier contient tous les styles globaux et les configurations Tailwind CSS de l'application.

## Conventions de nommage

- Fichiers CSS : `kebab-case.css`
- Classes Tailwind : Suivre la convention BEM avec Tailwind
- Variables CSS : `--kebab-case`

## Structure

```plaintext
styles/
├── globals.css     # Styles globaux
├── themes/         # Thèmes de l'application
└── components/     # Styles spécifiques aux composants
```

## Exemple

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --primary: #3b82f6;
    --secondary: #64748b;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded-md hover:opacity-90;
  }
}
```
