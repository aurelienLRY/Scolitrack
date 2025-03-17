# Dossier `config/`

## Utilisation

Ce dossier contient toutes les configurations centralisées de l'application, permettant une personnalisation facile des différentes fonctionnalités.

## Conventions de nommage

- Noms de fichiers : `kebab-case.config.ts`
- Noms des constantes de configuration : `camelCase`
- Types/Interfaces : `PascalCase`

## Structure

```plaintext
config/
├── pwa.config.ts      # Configuration de la PWA
├── theme.config.ts    # Configuration du thème
└── api.config.ts      # Configuration des API
```

## Exemple

```typescript
// config/pwa.config.ts
export const pwaConfig = {
  // Configuration de base
  customInstallPrompt: true,
  promptDelay: 1000,

  // Messages personnalisés
  messages: {
    title: "Mon Application",
    description: "Description de l'application",
  },

  // Style personnalisé
  style: {
    primaryColor: "#3b82f6",
  },
} as const;
```

## Bonnes pratiques

- Utiliser `as const` pour garantir l'immutabilité des configurations
- Documenter chaque option de configuration avec des commentaires
- Regrouper les options connexes dans des sous-objets
- Fournir des valeurs par défaut pour toutes les options
- Utiliser TypeScript pour un typage strict des configurations
