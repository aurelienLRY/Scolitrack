import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, DeleteButton, SaveButton } from "@/components/ui/button";

describe("Button", () => {
  it("affiche le libellé et déclenche le clic", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Enregistrer</Button>);
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("ignore le clic quand le bouton est désactivé", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Enregistrer
      </Button>
    );
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("applique les classes de la variante destructive", () => {
    render(
      <Button color="destructive" variant="solid">
        Supprimer
      </Button>
    );

    expect(screen.getByRole("button", { name: "Supprimer" })).toHaveClass(
      "bg-destructive"
    );
  });

  it("rend l'élément enfant quand asChild est actif", () => {
    render(
      <Button asChild>
        <a href="/private">Espace privé</a>
      </Button>
    );

    expect(screen.getByRole("link", { name: "Espace privé" })).toHaveAttribute(
      "href",
      "/private"
    );
  });
});

describe("DeleteButton", () => {
  it("affiche le libellé par défaut", () => {
    render(<DeleteButton />);

    expect(
      screen.getByRole("button", { name: "Supprimer" })
    ).toBeInTheDocument();
  });

  it("affiche l'infobulle au survol en mode icône", async () => {
    const user = userEvent.setup();

    render(<DeleteButton iconOnly>Supprimer le dossier</DeleteButton>);

    await user.hover(screen.getByRole("button"));

    expect(await screen.findByText("Supprimer le dossier")).toBeInTheDocument();
  });
});

describe("SaveButton", () => {
  it("affiche le libellé fourni", () => {
    render(<SaveButton>Valider le dossier</SaveButton>);

    expect(
      screen.getByRole("button", { name: "Valider le dossier" })
    ).toHaveClass("bg-success");
  });
});
