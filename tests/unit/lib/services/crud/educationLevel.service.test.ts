import {
  createEducationLevel,
  deleteEducationLevel,
  getEducationLevelById,
  getEducationLevelsByEstablishment,
} from "@/lib/services/crud/educationLevel.service";
import { prismaMock, resetPrismaMock } from "@tests/mocks/prisma";

vi.mock("@/lib/prisma/prisma", async () => {
  const { prismaMock: mockedPrisma } = await import("@tests/mocks/prisma");
  return { prisma: mockedPrisma };
});

const level = {
  id: "lvl-1",
  name: "CP",
  code: "CP",
  establishmentId: "est-1",
};

describe("educationLevelService", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("liste les niveaux d'un établissement triés par nom", async () => {
    prismaMock.educationLevel.findMany.mockResolvedValue([level]);

    const result = await getEducationLevelsByEstablishment("est-1");

    expect(prismaMock.educationLevel.findMany).toHaveBeenCalledWith({
      where: { establishmentId: "est-1" },
      orderBy: { name: "asc" },
    });
    expect(result).toEqual([level]);
  });

  it("retourne null quand le niveau n'existe pas", async () => {
    prismaMock.educationLevel.findUnique.mockResolvedValue(null);

    await expect(getEducationLevelById("absent")).resolves.toBeNull();
  });

  it("crée un niveau avec les données du formulaire", async () => {
    prismaMock.educationLevel.create.mockResolvedValue(level);
    const data = { name: "CP", code: "CP", establishmentId: "est-1" };

    await createEducationLevel(data);

    expect(prismaMock.educationLevel.create).toHaveBeenCalledWith({ data });
  });

  it("supprime un niveau par son identifiant", async () => {
    prismaMock.educationLevel.delete.mockResolvedValue(level);

    await deleteEducationLevel("lvl-1");

    expect(prismaMock.educationLevel.delete).toHaveBeenCalledWith({
      where: { id: "lvl-1" },
    });
  });
});
