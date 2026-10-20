import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input, SelectInput } from "@/components/ui/inputs/Input";

describe("Input", () => {
  it("relie le libellé au champ et accepte la saisie", async () => {
    const user = userEvent.setup();

    render(<Input label="Nom complet" name="name" />);
    const field = screen.getByRole("textbox", { name: "Nom complet" });

    await user.type(field, "Ada");

    expect(field).toHaveValue("Ada");
    expect(field).toHaveAttribute("aria-invalid", "false");
  });

  it("affiche l'erreur et masque le texte d'aide", () => {
    render(
      <Input
        label="Email"
        error={{ type: "required", message: "Email requis" }}
        helperText="Utiliser l'adresse professionnelle"
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Email requis");
    expect(
      screen.queryByText("Utiliser l'adresse professionnelle")
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("affiche le texte d'aide en l'absence d'erreur", () => {
    render(<Input label="Ville" helperText="Exemple : Lyon" />);

    expect(screen.getByText("Exemple : Lyon")).toBeInTheDocument();
  });
});

describe("SelectInput", () => {
  it("affiche les options fournies", () => {
    render(
      <SelectInput
        label="Niveau"
        error={undefined}
        options={[
          { id: "cp", name: "CP" },
          { id: "ce1", name: "CE1" },
        ]}
      />
    );

    expect(screen.getByText("Niveau")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "CP" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "CE1" })).toBeInTheDocument();
  });
});
