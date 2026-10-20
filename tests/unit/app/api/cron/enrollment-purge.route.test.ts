import { NextRequest } from "next/server";
import { ENROLLMENT_SOFT_DELETE_RETENTION_DAYS } from "@/lib/enrollment/soft-delete";

vi.mock("@/lib/services/enrollment/file.service", () => ({
  enrollmentFileService: {
    purgeSoftDeletedFiles: vi.fn(),
  },
}));

const { enrollmentFileService } = await import(
  "@/lib/services/enrollment/file.service"
);
const { GET } = await import("@/app/api/cron/enrollment-purge/route");

function requestWithAuth(header?: string | null) {
  const headers = new Headers();
  if (header) headers.set("authorization", header);
  return new NextRequest("http://localhost/api/cron/enrollment-purge", {
    headers,
  });
}

describe("GET /api/cron/enrollment-purge", () => {
  const previousSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.mocked(enrollmentFileService.purgeSoftDeletedFiles).mockReset();
    process.env.CRON_SECRET = "test-cron-secret";
  });

  afterEach(() => {
    process.env.CRON_SECRET = previousSecret;
  });

  it("refuse si CRON_SECRET n'est pas configuré", async () => {
    delete process.env.CRON_SECRET;

    const response = await GET(requestWithAuth("Bearer test-cron-secret"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      feedback: "CRON_SECRET non configuré",
    });
  });

  it("refuse un bearer incorrect", async () => {
    const response = await GET(requestWithAuth("Bearer wrong"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      feedback: "Non autorisé",
    });
  });

  it("purge et renvoie le résultat", async () => {
    vi.mocked(enrollmentFileService.purgeSoftDeletedFiles).mockResolvedValue({
      purged: 2,
      ids: ["a", "b"],
    });

    const response = await GET(requestWithAuth("Bearer test-cron-secret"));

    expect(enrollmentFileService.purgeSoftDeletedFiles).toHaveBeenCalledWith(
      30
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: { purged: 2, ids: ["a", "b"] },
      feedback: "2 dossier(s) purgé(s) définitivement",
    });
  });

  it("indique clairement qu'il n'y a rien à purger", async () => {
    vi.mocked(enrollmentFileService.purgeSoftDeletedFiles).mockResolvedValue({
      purged: 0,
      ids: [],
    });

    const response = await GET(requestWithAuth("Bearer test-cron-secret"));

    await expect(response.json()).resolves.toMatchObject({
      feedback: "Aucun dossier à purger",
    });
  });
});
