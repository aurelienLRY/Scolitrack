# Dossier `tests/`

Les tests vivent ici, en miroir de `src/`. L'outil est Vitest, avec Testing Library pour les composants et jsdom comme navigateur.

## Lancer les tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

`npm test` exécute la suite une fois et s'arrête. C'est la commande à brancher plus tard sur la CI.

## Structure

```plaintext
tests/
├── setup.ts                 # jest-dom, observers, mocks Next globaux
├── mocks/
│   ├── next-navigation.ts   # useRouter, usePathname, useParams
│   ├── next-auth.ts         # useSession, signIn, signOut
│   └── prisma.ts            # prismaMock
├── utils/
│   └── render.tsx           # rendu avec QueryClient
├── unit/                    # même découpage que src/
│   ├── components/
│   │   ├── enrollment-form/
│   │   └── ui/
│   ├── config/              # privilèges, routes, catalogues inscription
│   ├── lib/
│   │   ├── prisma/
│   │   ├── services/
│   │   │   ├── crud/
│   │   │   └── enrollment/
│   │   └── utils/
│   ├── schemas/
│   └── types/
├── integration/
└── e2e/
```

Un test de `src/lib/services/crypto.service.ts` se place dans `tests/unit/lib/services/crypto.service.test.ts`. Les noms de tests sont en français.

## Écrire un test

Les globales Vitest (`describe`, `it`, `expect`, `vi`) sont disponibles. L'alias `@/` pointe vers `src/`, l'alias `@tests/` vers ce dossier.

```tsx
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("affiche le libellé", () => {
    render(<Button>Enregistrer</Button>);
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeInTheDocument();
  });
});
```

## Mocks

`next/navigation`, `next/image` et `next-auth/react` sont mockés pour toute la suite. Pour changer la route ou la session d'un test :

```ts
import { navigationState } from "@tests/mocks/next-navigation";
import { authState } from "@tests/mocks/next-auth";

navigationState.pathname = "/private/enrollment";
authState.status = "authenticated";
authState.session = { user: { privileges: ["MANAGE_ENROLLMENTS"] } };
```

Pour un service qui importe Prisma, mocker le module et réutiliser `prismaMock` :

```ts
import { prismaMock, resetPrismaMock } from "@tests/mocks/prisma";

vi.mock("@/lib/prisma/prisma", async () => {
  const { prismaMock: mockedPrisma } = await import("@tests/mocks/prisma");
  return { prisma: mockedPrisma };
});

beforeEach(() => {
  resetPrismaMock();
});
```

Les composants branchés sur TanStack Query se rendent avec `renderWithProviders` depuis `@tests/utils/render`.

`ENCRYPTION_KEY` est fixé dans `vitest.config.ts` pour que le chiffrement soit déterministe.
