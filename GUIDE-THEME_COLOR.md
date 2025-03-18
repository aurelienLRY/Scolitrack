# Guide des Couleurs de Thème pour Scolitrack

Ce guide explique comment utiliser et personnaliser le système de thèmes dans l'application Scolitrack.

## 1. Structure et Fichiers Clés

```plaintext
src/
├── styles/
│   └── globals.css        # Définition des variables de couleur et thèmes
├── app/
│   ├── layout.tsx         # Configuration HTML racine des thèmes
│   └── template.tsx       # Configuration du ThemeProvider
├── components/
│   └── layout/
│       └── theme-switch/
│           └── ThemeSwitch.tsx  # Bouton de changement de thème
└── config/
    └── app.config.ts      # Configuration des couleurs de l'application
```

## 2. Système de Thèmes

Scolitrack utilise un système de thèmes moderne basé sur:

1. **Tailwind CSS** pour les styles et les utilitaires
2. **CSS Variables** pour les valeurs de couleur dynamiques
3. **next-themes** pour la gestion des modes clair/sombre
4. **Attributs data-theme** pour les thèmes personnalisés

## 3. Comment Utiliser les Couleurs de Thème

### Couleurs Disponibles

Les couleurs principales du thème sont:

| Variable             | Description        | Usage recommandé                         |
| -------------------- | ------------------ | ---------------------------------------- |
| `--color-primary`    | Couleur principale | Boutons, liens, éléments d'accent        |
| `--color-secondary`  | Couleur secondaire | Badges, indicateurs, accents secondaires |
| `--color-background` | Couleur de fond    | Arrière-plan des pages et composants     |
| `--color-text`       | Couleur du texte   | Texte principal, adaptée au fond         |

### Utilisation dans les Composants

Pour utiliser les couleurs du thème dans vos composants:

```tsx
// Exemple d'utilisation des couleurs de thème
function MonComposant() {
  return (
    <div className="bg-background p-4 rounded-lg">
      <h2 className="text-2xl font-bold text-primary">
        Titre avec couleur primaire
      </h2>
      <p className="text-text mt-2">
        Ce texte utilise la couleur de texte du thème
      </p>
      <button className="bg-secondary text-dark px-4 py-2 rounded-md mt-4">
        Bouton avec couleur secondaire
      </button>
    </div>
  );
}
```

### Classes Utilitaires Principales

| Classe           | Description                                     |
| ---------------- | ----------------------------------------------- |
| `text-primary`   | Applique la couleur primaire au texte           |
| `bg-primary`     | Applique la couleur primaire à l'arrière-plan   |
| `text-secondary` | Applique la couleur secondaire au texte         |
| `bg-secondary`   | Applique la couleur secondaire à l'arrière-plan |
| `bg-background`  | Applique la couleur de fond thématique          |
| `text-text`      | Applique la couleur de texte thématique         |

## 4. Modes Clair et Sombre

### Comment le Système Détecte le Mode

Le système utilise `next-themes` pour détecter et appliquer automatiquement le thème préféré de l'utilisateur:

1. **Détection initiale** basée sur les préférences système
2. **Persistance** du choix utilisateur dans le localStorage
3. **Application dynamique** sans rechargement de page

### Comment Ajouter le Sélecteur de Thème

Pour permettre aux utilisateurs de changer de thème, ajoutez le composant `ThemeSwitch`:

```tsx
import { ThemeSwitch } from "@/components/layout/theme-switch/ThemeSwitch";

function MonHeader() {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>Mon Application</h1>
      <ThemeSwitch />
    </header>
  );
}
```

### Créer des Styles Spécifiques au Mode

Pour créer des styles différents selon le mode:

```tsx
// Style qui change selon le mode clair/sombre
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Ce contenu s'adapte au thème
</div>

// Variante avec les couleurs du thème
<div className="bg-background text-text border border-primary/20 dark:border-primary/10">
  Ce contenu utilise les couleurs du thème et ajuste l'opacité selon le mode
</div>
```

## 5. Personnalisation des Thèmes

### Comment Modifier les Couleurs Existantes

Pour modifier les couleurs du thème par défaut, mettez à jour le fichier `src/styles/globals.css`:

```css
@theme {
  /* Remplacez ces valeurs par vos couleurs personnalisées */
  --color-primary: light-dark(
    #0066cc,
    #3388ff
  ); /* Bleu plus foncé/plus clair */
  --color-secondary: light-dark(
    #ff6600,
    #ff9944
  ); /* Orange plus foncé/plus clair */

  /* Assurez-vous de définir à la fois la version claire et sombre */
  --color-background: light-dark(#ffffff, #121212);
  --color-text: light-dark(#111111, #f5f5f5);
}
```

### Comment Créer un Nouveau Thème

Pour créer un thème entièrement nouveau (par exemple "vert"):

1. Ajoutez les définitions de couleur dans `src/styles/globals.css`:

```css
/* Définition du thème "vert" */
[data-theme="vert"] {
  --color-primary: light-dark(#2e7d32, #4caf50);
  --color-secondary: light-dark(#f57c00, #ffb74d);
  --color-background: light-dark(#f1f8e9, #1b2618);
  --color-text: light-dark(#212121, #eceff1);
}
```

2. Pour appliquer ce thème à toute l'application, modifiez `src/app/layout.tsx`:

```tsx
<html
  lang="fr"
  className="dark:scheme-dark scheme-light bg-background text-text"
  data-theme="vert"
>
```

3. Pour permettre à l'utilisateur de choisir le thème, créez un sélecteur:

```tsx
function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="border border-primary rounded px-2 py-1"
    >
      <option value="system">Système</option>
      <option value="light">Clair</option>
      <option value="dark">Sombre</option>
      <option value="vert">Vert</option>
    </select>
  );
}
```

## 6. Utilisation dans l'App Config

Les couleurs principales de l'application sont également définies dans `src/config/app.config.ts` pour une utilisation dans les métadonnées:

```typescript
// Extrait de app.config.ts
export const appConfig = {
  // ...autres configurations
  colors: {
    colorBackground: "#ffffff",
    colorPrimary: "#3545d6",
  },
  // ...autres configurations
};
```

Pour mettre à jour ces valeurs, assurez-vous qu'elles correspondent aux couleurs définies dans votre thème.

## 7. Exemples Pratiques

### Layout de Page avec Thème

```tsx
export default function PageLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary/10 p-4">
        <h1 className="text-primary font-bold text-2xl">Scolitrack</h1>
      </header>

      <main className="container mx-auto p-4 text-text">
        {/* Contenu de page */}
      </main>

      <footer className="mt-auto p-4 bg-primary/5 text-text/80 text-sm">
        © 2023 Scolitrack
      </footer>
    </div>
  );
}
```

### Carte avec Accents de Couleur

```tsx
function InfoCard({ title, children }) {
  return (
    <div className="border border-primary/20 rounded-lg p-4 bg-background shadow">
      <h3 className="font-medium text-primary border-b border-primary/10 pb-2">
        {title}
      </h3>
      <div className="mt-2 text-text">{children}</div>
    </div>
  );
}
```

### Boutons avec Thème

```tsx
function ThemedButton({ variant = "primary", children, ...props }) {
  const styles = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    secondary: "bg-secondary hover:bg-secondary/90 text-dark",
    outline: "border border-primary text-primary hover:bg-primary/10",
    ghost: "text-primary hover:bg-primary/10",
  };

  return (
    <button
      className={`px-4 py-2 rounded transition-colors ${styles[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

## 8. Accessibilité et Bonnes Pratiques

### Contraste et Lisibilité

- Assurez-vous que vos combinaisons de couleurs respectent les ratios de contraste WCAG:
  - 4.5:1 pour le texte normal
  - 3:1 pour le texte large ou les éléments UI
- Testez votre thème avec des outils comme Lighthouse ou WebAIM

### Conseils de Mise en Œuvre

1. **Cohérence sémantique**: Utilisez les couleurs selon leur fonction, pas leur apparence
2. **États interactifs**: Utilisez des variations cohérentes pour hover, focus, active
3. **Feedback visuel**: Assurez-vous que les actions sont clairement indiquées
4. **Utilisez les opacités**: Créez des variations avec opacity (bg-primary/10) au lieu de nouvelles couleurs
5. **Ne codez pas en dur**: Évitez d'utiliser des valeurs hexadécimales directement dans vos composants

## 9. Résolution des Problèmes

### Les couleurs ne s'appliquent pas correctement

1. Vérifiez que le `ThemeProvider` enveloppe votre application
2. Assurez-vous que les variables CSS sont correctement définies
3. Confirmez que vous utilisez les classes Tailwind correspondant aux variables

### Le mode sombre ne fonctionne pas

1. Vérifiez que l'attribut `dark` est correctement appliqué à l'élément HTML
2. Confirmez que vos classes utilisent le préfixe `dark:` pour les variations
3. Assurez-vous que `next-themes` est correctement configuré

### Les couleurs personnalisées ne s'appliquent pas

1. Vérifiez que l'attribut `data-theme` est appliqué à l'élément HTML racine
2. Confirmez que les sélecteurs CSS pour votre thème sont correctement définis
3. Assurez-vous que les noms de variables correspondent entre vos définitions et leur utilisation

## 10. Ressources Additionnelles

- [Documentation de Tailwind CSS](https://tailwindcss.com/docs/customizing-colors)
- [Guide Next-themes](https://github.com/pacocoursey/next-themes)
- [Guide d'accessibilité des couleurs WCAG](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Outil de vérification de contraste WebAIM](https://webaim.org/resources/contrastchecker/)
