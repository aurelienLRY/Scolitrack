import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignatureRequestBlock from "@/components/enrollment-form/SignatureRequestBlock";
import FetchService from "@/lib/services/fetch.service";

vi.mock("@/lib/services/fetch.service", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const { toast } = await import("sonner");

describe("SignatureRequestBlock", () => {
  beforeEach(() => {
    vi.mocked(FetchService.get).mockResolvedValue({
      success: true,
      feedback: "ok",
      data: [],
    });
    vi.mocked(FetchService.post).mockResolvedValue({
      success: true,
      feedback: "ok",
      data: {},
    });
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it("charge les signatures du dossier au montage", async () => {
    render(
      <SignatureRequestBlock
        fileToken="tok-1"
        email="parent@example.com"
        subjectKey="FICHE1_HORAIRES"
      />
    );

    await waitFor(() => {
      expect(FetchService.get).toHaveBeenCalledWith(
        "/api/enrollment/signatures?fileToken=tok-1"
      );
    });

    expect(
      screen.getByText("Horaires & fonctionnement de l'école")
    ).toBeInTheDocument();
  });

  it("bloque l'envoi tant que les infos n'ont pas été lues", async () => {
    render(
      <SignatureRequestBlock
        fileToken="tok-1"
        email="parent@example.com"
        subjectKey="FICHE1_HORAIRES"
      />
    );

    await waitFor(() => expect(FetchService.get).toHaveBeenCalled());

    expect(
      screen.getByRole("button", { name: /Envoyer pour signer/i })
    ).toBeDisabled();
    expect(
      screen.getByText(/Lisez les informations pour activer/i)
    ).toBeInTheDocument();
  });

  it("envoie la demande après lecture des infos", async () => {
    const user = userEvent.setup();

    render(
      <SignatureRequestBlock
        fileToken="tok-1"
        email="parent@example.com"
        subjectKey="FICHE1_HORAIRES"
      />
    );

    await waitFor(() => expect(FetchService.get).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: /Lire les infos/i }));
    await user.click(
      await screen.findByRole("button", { name: /J'ai lu — continuer/i })
    );

    const sendButton = screen.getByRole("button", {
      name: /Envoyer pour signer/i,
    });
    expect(sendButton).toBeEnabled();

    await user.click(sendButton);

    await waitFor(() => {
      expect(FetchService.post).toHaveBeenCalledWith(
        "/api/enrollment/signatures",
        expect.objectContaining({
          fileToken: "tok-1",
          email: "parent@example.com",
          subjectKey: "FICHE1_HORAIRES",
        })
      );
    });
    expect(toast.success).toHaveBeenCalled();
  });

  it("affiche le statut signé sans bouton d'envoi", async () => {
    vi.mocked(FetchService.get).mockResolvedValue({
      success: true,
      feedback: "ok",
      data: [
        {
          id: "sig-1",
          email: "parent@example.com",
          subjectKey: "FICHE1_HORAIRES",
          scopeRef: "",
          subjectLabel: "Horaires",
          status: "SIGNED",
        },
      ],
    });

    render(
      <SignatureRequestBlock
        fileToken="tok-1"
        email="parent@example.com"
        subjectKey="FICHE1_HORAIRES"
      />
    );

    expect(await screen.findByText(/^Signé$/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Envoyer pour signer/i })
    ).not.toBeInTheDocument();
  });

  it("personnalise le libellé avec le prénom de l'enfant", async () => {
    render(
      <SignatureRequestBlock
        fileToken="tok-1"
        email="parent@example.com"
        subjectKey="FICHE3_SORTIES"
        scopeRef="child-1"
        childName="Léa"
      />
    );

    expect(
      await screen.findByText("Sorties & classes de découverte — Léa")
    ).toBeInTheDocument();
  });
});
