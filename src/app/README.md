# Dossier `app/`

## Utilisation

Ce dossier est la pierre angulaire de l'App Router de Next.js 13+. Il contient toutes les pages et routes de l'application.

## Conventions de nommage

- Dossiers de groupement : `(kebab-case)` - ex: `(public-pages)`
- Fichiers de page : `page.tsx`
- Fichiers de layout : `layout.tsx`
- Fichiers de route API : `route.ts`

## Structure

```plaintext
app/
├── (public-pages)/     # Pages publiques
├── (protected-pages)/  # Pages protégées
├── api/               # Routes API
├── layout.tsx         # Layout global
├── page.tsx          # Page d'accueil
├── error.tsx         # Gestion d'erreurs
└── loading.tsx       # États de chargement
```

## Exemple

```typescript
// app/(public-pages)/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>À propos</h1>
    </div>
  );
}
```
