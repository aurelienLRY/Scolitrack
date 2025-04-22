import { prisma } from "@/lib/prisma/prisma";
import {
  EstablishmentFormData,
  EstablishmentUpdateFormData,
} from "@/schemas/establishmentSchema";
import { Establishment } from "@prisma/client";

/**
 * Récupère tous les établissements
 */
export async function getAllEstablishments(): Promise<Establishment[]> {
  return prisma.establishment.findMany({
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          roleName: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

/**
 * Récupère un établissement par son ID
 */
export async function getEstablishmentById(
  id: string
): Promise<Establishment | null> {
  return prisma.establishment.findUnique({
    where: { id },
    include: {
      admin: true,
    },
  });
}

/**
 * Crée un nouvel établissement
 */
export async function createEstablishment(
  data: EstablishmentFormData
): Promise<Establishment> {
  // Extraire adminId pour utiliser la syntaxe de relation correcte
  const { adminId, ...establishmentData } = data;

  return prisma.establishment.create({
    data: {
      ...establishmentData,
      admin: {
        connect: { id: adminId },
      },
    },
    include: {
      admin: true,
    },
  });
}

/**
 * Met à jour un établissement existant
 */
export async function updateEstablishment(
  id: string,
  data: EstablishmentUpdateFormData
): Promise<Establishment> {
  // Extraire adminId pour utiliser la syntaxe de relation correcte
  const { adminId, ...establishmentData } = data;

  // Préparer l'objet de données pour la mise à jour avec le type correct pour Prisma
  type EstablishmentUpdateInput = Omit<
    EstablishmentUpdateFormData,
    "adminId"
  > & {
    admin?: {
      connect: { id: string };
    };
  };

  const updateData: EstablishmentUpdateInput = { ...establishmentData };

  // Si adminId est fourni, utiliser la syntaxe connect pour la relation
  if (adminId) {
    updateData.admin = {
      connect: { id: adminId },
    };
  }

  return prisma.establishment.update({
    where: { id },
    data: updateData,
    include: {
      admin: true,
    },
  });
}

/**
 * Vérifie si un utilisateur est administrateur d'un établissement
 */
export async function isAdminOfEstablishment(
  userId: string,
  establishmentId: string
): Promise<boolean> {
  const establishment = await prisma.establishment.findFirst({
    where: {
      id: establishmentId,
      adminId: userId,
    },
  });

  return !!establishment;
}
