import FetchService from "@/lib/services/fetch.service";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

describe("FetchService", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("envoie un GET et retourne le corps quand success est vrai", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: true, feedback: "ok", data: [{ id: "1" }] })
    );

    const result = await FetchService.get<{ id: string }[]>("/api/users");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/users",
      expect.objectContaining({
        method: "GET",
        credentials: "same-origin",
      })
    );
    expect(result.data).toEqual([{ id: "1" }]);
  });

  it("sérialise le corps d'un POST", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: true, feedback: "créé", data: { id: "2" } })
    );

    await FetchService.post("/api/users", { name: "Ada" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/users",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Ada" }),
      })
    );
  });

  it("propage le feedback quand l'API répond en échec métier", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: false, feedback: "Email déjà utilisé" })
    );

    await expect(FetchService.get("/api/users")).rejects.toThrow(
      "Email déjà utilisé"
    );
  });

  it("propage le feedback HTTP quand la réponse n'est pas ok", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ feedback: "Accès refusé" }, 403)
    );

    await expect(FetchService.delete("/api/users/1")).rejects.toThrow(
      "Accès refusé"
    );
  });

  it("retombe sur le statut HTTP si le corps n'est pas du JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: vi.fn().mockRejectedValue(new Error("invalid json")),
    });

    await expect(FetchService.get("/api/users")).rejects.toThrow(
      "Erreur HTTP: 502"
    );
  });
});
