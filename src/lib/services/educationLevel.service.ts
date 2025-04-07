import { prisma } from "@/lib/prisma/prisma";
import {
  EducationLevelFormData,
  EducationLevelUpdateFormData,
} from "@/schemas/educationLevelSchema";
import { EducationLevel } from "@prisma/client";

/**
 * Récupère tous les niveaux d'éducation d'un établissement
 */
export async function getEducationLevelsByEstablishment(
  establishmentId: string
): Promise<EducationLevel[]> {
  return prisma.educationLevel.findMany({
    where: { establishmentId },
    orderBy: { name: "asc" },
  });
}

/**
 * Récupère un niveau d'éducation par son ID
 */
export async function getEducationLevelById(
  id: string
): Promise<EducationLevel | null> {
  return prisma.educationLevel.findUnique({
    where: { id },
  });
}

/**
 * Crée un nouveau niveau d'éducation
 */
export async function createEducationLevel(
  data: EducationLevelFormData
): Promise<EducationLevel> {
  return prisma.educationLevel.create({
    data,
  });
}

/**
 * Met à jour un niveau d'éducation
 */
export async function updateEducationLevel(
  id: string,
  data: EducationLevelUpdateFormData
): Promise<EducationLevel> {
  return prisma.educationLevel.update({
    where: { id },
    data,
  });
}

/**
 * Supprime un niveau d'éducation
 */
export async function deleteEducationLevel(
  id: string
): Promise<EducationLevel> {
  return prisma.educationLevel.delete({
    where: { id },
  });
}

export const educationLevelService = {
  getEducationLevelsByEstablishment,
  getEducationLevelById,
  createEducationLevel,
  updateEducationLevel,
  deleteEducationLevel,
};
