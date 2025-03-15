# Dossier `tests/`

## Utilisation

Ce dossier contient tous les tests de l'application, organisés par type de test.

## Conventions de nommage

- Fichiers de test : `*.test.ts` ou `*.spec.ts`
- Noms des tests : Descriptifs et en français
- Groupes de tests : Utiliser `describe` et `it`/`test`

## Structure

```plaintext
tests/
├── unit/           # Tests unitaires
├── integration/    # Tests d'intégration
└── e2e/           # Tests end-to-end
```

## Exemple

```typescript
// tests/unit/components/Button.test.tsx
import { render, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button Component", () => {
  it("devrait rendre le bouton avec le texte correct", () => {
    const { getByText } = render(<Button>Cliquez-moi</Button>);
    expect(getByText("Cliquez-moi")).toBeInTheDocument();
  });

  it("devrait appeler onClick quand cliqué", () => {
    const handleClick = jest.fn();
    const { getByRole } = render(
      <Button onClick={handleClick}>Cliquez-moi</Button>
    );

    fireEvent.click(getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```
