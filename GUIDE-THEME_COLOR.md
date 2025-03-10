# Guide des Couleurs de Thème

Ce guide explique comment les couleurs de thème sont implémentées et peuvent être utilisées dans le projet Next Perfect.

## Table des matières

1. [Introduction](#introduction)
2. [Configuration des thèmes](#configuration-des-thèmes)
3. [Utilisation des couleurs de thème](#utilisation-des-couleurs-de-thème)
4. [Changement de thème](#changement-de-thème)
5. [Création de nouveaux thèmes](#création-de-nouveaux-thèmes)
6. [Bonnes pratiques](#bonnes-pratiques)

## Introduction

Le projet Next Perfect utilise un système de thèmes basé sur Tailwind CSS v4 et la bibliothèque `next-themes` pour gérer les thèmes clair et sombre, ainsi que des thèmes personnalisés. Cette approche permet une expérience utilisateur cohérente et personnalisable.

## Configuration des thèmes

### Configuration de base

Les couleurs de thème sont définies dans le fichier `src/styles/globals.css` en utilisant la nouvelle syntaxe `@theme` de Tailwind CSS v4 :

```css
@theme {
  --color-primary: light-dark(#5363ee, #3545d6); /* Bleu royal */
  --color-secondary: light-dark(#c2f750, #c2f750); /* Vert lime */
  --color-dark: light-dark(#0e1a27, #0e1a27);
  /* Variantes de couleurs */
  --color-primary-light: light-dark(#6474ff, #4656e7);
  --color-primary-dark: light-dark(#4252dd, #2434c5);

  /* Couleurs de fond et texte */
  --color-background: light-dark(#ffffff, #0e1a27);
  --color-text: light-dark(#0e1a27, #ffffff);
}
```

La fonction `light-dark()` permet de définir une valeur pour le mode clair (premier argument) et une valeur pour le mode sombre (second argument).

### Configuration du ThemeProvider

Le projet utilise `next-themes` pour gérer les thèmes. La configuration se trouve dans `src/app/template.tsx` :

```tsx
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

Les paramètres importants sont :

- `attribute="class"` : Utilise les classes CSS pour appliquer le thème
- `defaultTheme="system"` : Utilise par défaut le thème du système
- `enableSystem` : Permet de détecter le thème du système

### Configuration HTML racine

Dans `src/app/layout.tsx`, la balise HTML racine est configurée pour appliquer les thèmes :

```tsx
<html
  lang="fr"
  className="dark scheme-light dark:scheme-dark bg-background text-text"
  data-theme="exemple"
>
```

- `className="dark"` : Force le mode sombre par défaut
- `scheme-light dark:scheme-dark` : Applique des schémas de couleur différents selon le mode
- `bg-background text-text` : Applique les couleurs de fond et de texte du thème
- `data-theme="exemple"` : Applique un thème personnalisé (à remplacer par le thème souhaité)

## Utilisation des couleurs de thème

Les couleurs de thème peuvent être utilisées directement dans les classes Tailwind :

```tsx
<h2 className="text-4xl text-primary">sur theme color</h2>
<button className="bg-secondary px-4 py-2 rounded-md mt-11">
  Theme color
</button>
```

## Changement de thème

Le composant `ThemeSwitch` dans `src/components/layout/theme-swith/ThemeSwitch.tsx` permet de basculer entre les modes clair et sombre :

```tsx
export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" aria-hidden="true" />;
  }

  return (
    <button
      className="theme-switch-button bg-background group w-10 h-10"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Changer le thème"
    >
      <div className="relative flex items-center justify-center p-1">
        {resolvedTheme === "dark" ? (
          <SunIcon className="w-5 h-5 group-hover:text-secondary transition-all duration-300" />
        ) : (
          <MoonIcon className="w-5 h-5 group-hover:text-secondary transition-all duration-300" />
        )}
      </div>
    </button>
  );
}
```

## Création de nouveaux thèmes

Pour créer un nouveau thème, ajoutez un sélecteur `[data-theme="nom-du-theme"]` dans `src/styles/globals.css` :

```css
[data-theme="vert"] {
  --color-primary: light-dark(
    #c2f750,
    #c2f750
  ); /* Vert lime comme couleur principale */
  --color-secondary: light-dark(
    #5363ee,
    #3545d6
  ); /* Bleu royal comme couleur secondaire */
}
```

Pour appliquer ce thème, ajoutez l'attribut `data-theme` à la balise HTML racine dans `src/app/layout.tsx` :

```tsx
<html
  lang="fr"
  className="dark scheme-light dark:scheme-dark bg-background text-text"
  data-theme="vert"
>
```

## Bonnes pratiques

1. **Utiliser les variables de couleur** : Toujours utiliser les variables de couleur définies dans le thème plutôt que des valeurs codées en dur.

2. **Respecter la sémantique** : Utiliser les couleurs selon leur rôle sémantique (primary, secondary, etc.) plutôt que selon leur apparence visuelle.

3. **Tester les deux modes** : Toujours tester l'application en mode clair et en mode sombre pour s'assurer que les contrastes sont suffisants.

4. **Limiter le nombre de couleurs** : Limiter le nombre de couleurs dans un thème pour maintenir la cohérence visuelle.

5. **Documenter les thèmes** : Documenter les thèmes disponibles et leur utilisation prévue.

6. **Prévoir l'accessibilité** : S'assurer que les combinaisons de couleurs respectent les normes d'accessibilité (WCAG).

7. **Utiliser les variantes** : Utiliser les variantes de couleurs (light, dark) pour les états des composants (hover, focus, etc.).
