import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EnrollmentInfoButton from "@/components/enrollment-form/EnrollmentInfoButton";

describe("EnrollmentInfoButton", () => {
  it("ouvre la modale d'information au clic", async () => {
    const user = userEvent.setup();

    render(<EnrollmentInfoButton docId="horaires" label="Lire les horaires" />);

    expect(screen.queryByText(/Horaires de classe/i)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Lire les horaires/i })
    );

    expect(
      await screen.findByRole("heading", { name: /Horaires & fonctionnement/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Horaires de classe/i)).toBeInTheDocument();
  });
});
