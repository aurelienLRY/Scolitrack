import {
  createdResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
  notFoundResponse,
  successResponse,
} from "@/lib/services/api.service";

describe("réponses API", () => {
  it("construit une réponse de succès", async () => {
    const response = successResponse({
      data: { id: "user-1" },
      feedback: "Utilisateur récupéré",
      meta: { page: 1 },
    });

    expect(response.status).toBe(HttpStatus.OK);
    await expect(response.json()).resolves.toEqual({
      success: true,
      feedback: "Utilisateur récupéré",
      data: { id: "user-1" },
      meta: { page: 1 },
    });
  });

  it("construit une réponse de création", async () => {
    const response = createdResponse({ data: { id: "user-2" } });

    expect(response.status).toBe(HttpStatus.CREATED);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      feedback: "Ressource créée avec succès",
      data: { id: "user-2" },
    });
  });

  it("construit une erreur et une ressource introuvable", async () => {
    const error = errorResponse({ feedback: "Données invalides" });
    const missing = notFoundResponse();

    expect(error.status).toBe(HttpStatus.BAD_REQUEST);
    expect(missing.status).toBe(HttpStatus.NOT_FOUND);
    await expect(missing.json()).resolves.toMatchObject({
      success: false,
      feedback: "Ressource non trouvée",
    });
  });
});

describe("handleApiError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("renvoie 400 pour une erreur de validation", async () => {
    const error = new Error("Email invalide");
    error.name = "ValidationError";

    const response = handleApiError(error);

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      feedback: "Email invalide",
    });
  });

  it("renvoie 409 quand la ressource existe déjà", async () => {
    const response = handleApiError(new Error("Cet email existe déjà"));

    expect(response.status).toBe(HttpStatus.CONFLICT);
  });

  it("renvoie 400 pour les règles métier corbeille / Impossible…", async () => {
    const softDeleted = handleApiError(
      new Error("Ce dossier est déjà dans la corbeille")
    );
    const notInTrash = handleApiError(
      new Error("Ce dossier n'est pas dans la corbeille")
    );
    const campaignRule = handleApiError(
      new Error(
        "Impossible de supprimer une campagne dont la date de fin n'est pas encore passée"
      )
    );

    expect(softDeleted.status).toBe(HttpStatus.BAD_REQUEST);
    expect(notInTrash.status).toBe(HttpStatus.BAD_REQUEST);
    expect(campaignRule.status).toBe(HttpStatus.BAD_REQUEST);
    await expect(campaignRule.json()).resolves.toMatchObject({
      feedback: expect.stringContaining("Impossible de supprimer"),
    });
  });

  it("renvoie 500 avec le message par défaut pour une valeur inconnue", async () => {
    const response = handleApiError("panne", "Lecture impossible");

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toMatchObject({
      feedback: "Lecture impossible",
    });
  });
});
