import { prisma } from "@/lib/prisma/prisma";
import { ClassRoomPersonnel } from "@prisma/client";
import {
  classRoomSchema,
  classRoomUpdateSchema,
  classRoomPersonnelSchema,
  TClassRoomFormData,
  TClassRoomUpdateFormData,
  TClassRoomPersonnelFormData,
} from "@/schemas/ClassRoomSchema";

import {
  ClassRoomComplete,
  ClassRoomPersonnelWithUser,
} from "@/types/classroom.type";

/**
 * Requête standard pour inclure toutes les relations d'une classe
 * Utilisée pour standardiser les réponses dans tous les services
 */
const classRoomInclude = {
  educationLevels: {
    include: {
      educationLevel: true,
    },
  },
  classPersonnel: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          roleName: true,
          image: true,
        },
      },
    },
  },
};

export const classRoomService = {
  /**
   * Récupère toutes les classes d'un établissement
   */
  async getClassRoomsByEstablishment(
    establishmentId: string
  ): Promise<ClassRoomComplete[]> {
    return prisma.classRoom.findMany({
      where: { establishmentId },
      orderBy: { name: "asc" },
      include: classRoomInclude,
    }) as Promise<ClassRoomComplete[]>;
  },

  /**
   * Récupère une classe par son ID
   */
  async getClassRoomById(id: string): Promise<ClassRoomComplete | null> {
    return prisma.classRoom.findUnique({
      where: { id },
      include: classRoomInclude,
    }) as Promise<ClassRoomComplete | null>;
  },

  /**
   * Crée une nouvelle classe avec validation des données
   */
  async createClassRoom(data: TClassRoomFormData): Promise<ClassRoomComplete> {
    const validatedData = await classRoomSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const { educationLevelIds, ...classRoomData } = validatedData;

    // Utiliser une approche en deux étapes pour contourner les problèmes de typage
    // 1. Créer d'abord la classe
    const newClassRoom = await prisma.classRoom.create({
      data: {
        ...classRoomData,
        capacity:
          typeof classRoomData.capacity === "number"
            ? classRoomData.capacity
            : 0,
      },
    });

    // 2. Ajouter les relations d'éducation
    if (educationLevelIds && educationLevelIds.length > 0) {
      await Promise.all(
        educationLevelIds.map((levelId) =>
          prisma.classRoomEducationLevel.create({
            data: {
              classRoomId: newClassRoom.id,
              educationLevelId: levelId || "",
            },
          })
        )
      );
    }

    // 3. Récupérer la classe complète avec ses relations
    const classRoomWithRelations = await prisma.classRoom.findUnique({
      where: { id: newClassRoom.id },
      include: classRoomInclude,
    });

    if (!classRoomWithRelations) {
      throw new Error("Erreur lors de la création de la classe");
    }

    return classRoomWithRelations as ClassRoomComplete;
  },

  /**
   * Met à jour une classe existante avec validation des données
   */
  async updateClassRoom(
    id: string,
    data: TClassRoomUpdateFormData
  ): Promise<ClassRoomComplete> {
    const validatedData = await classRoomUpdateSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const { educationLevelIds, ...classRoomData } = validatedData;

    // 1. Mettre à jour les données de base de la classe
    await prisma.classRoom.update({
      where: { id },
      data: {
        ...classRoomData,
        capacity:
          typeof classRoomData.capacity === "number"
            ? classRoomData.capacity
            : undefined,
      },
    });

    // 2. Si educationLevelIds est fourni, mettre à jour les relations
    if (educationLevelIds) {
      // Supprimer les relations existantes
      await prisma.classRoomEducationLevel.deleteMany({
        where: {
          classRoomId: id,
        },
      });

      // Créer les nouvelles relations
      if (educationLevelIds.length > 0) {
        await Promise.all(
          educationLevelIds.map((levelId) =>
            prisma.classRoomEducationLevel.create({
              data: {
                classRoomId: id,
                educationLevelId: levelId || "",
              },
            })
          )
        );
      }
    }

    // 3. Récupérer la classe mise à jour avec ses relations
    const classRoomWithRelations = await prisma.classRoom.findUnique({
      where: { id },
      include: classRoomInclude,
    });

    if (!classRoomWithRelations) {
      throw new Error("Erreur lors de la mise à jour de la classe");
    }

    return classRoomWithRelations as ClassRoomComplete;
  },

  /**
   * Supprime une classe
   */
  async deleteClassRoom(id: string): Promise<ClassRoomComplete> {
    return prisma.classRoom.delete({
      where: { id },
      include: classRoomInclude,
    }) as Promise<ClassRoomComplete>;
  },

  /**
   * Attribue un membre du personnel à une classe avec validation des données
   */
  async assignPersonnelToClassRoom(
    classRoomId: string,
    data: TClassRoomPersonnelFormData
  ): Promise<ClassRoomPersonnel> {
    // Validation des données
    const validatedData = await classRoomPersonnelSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Vérifier si le personnel est déjà assigné à cette classe
    const existingPersonnel = await prisma.classRoomPersonnel.findUnique({
      where: {
        classRoomId_userId: {
          classRoomId,
          userId: validatedData.userId,
        },
      },
    });

    // Si le personnel existe déjà, mettre à jour son rôle
    if (existingPersonnel) {
      return prisma.classRoomPersonnel.update({
        where: {
          classRoomId_userId: {
            classRoomId,
            userId: validatedData.userId,
          },
        },
        data: {
          roleInClass: validatedData.roleInClass,
        },
      }) as Promise<ClassRoomPersonnel>;
    }

    // Sinon, créer une nouvelle assignation
    return prisma.classRoomPersonnel.create({
      data: {
        classRoomId,
        userId: validatedData.userId,
        roleInClass: validatedData.roleInClass,
      },
    }) as Promise<ClassRoomPersonnel>;
  },

  /**
   * Supprime un membre du personnel d'une classe
   */
  async removePersonnelFromClassRoom(
    classRoomId: string,
    userId: string
  ): Promise<ClassRoomPersonnel> {
    return prisma.classRoomPersonnel.delete({
      where: {
        classRoomId_userId: {
          classRoomId,
          userId,
        },
      },
    }) as Promise<ClassRoomPersonnel>;
  },

  /**
   * Récupère tous les membres du personnel d'une classe
   */
  async getClassRoomPersonnel(
    classRoomId: string
  ): Promise<ClassRoomPersonnelWithUser[]> {
    return prisma.classRoomPersonnel.findMany({
      where: { classRoomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roleName: true,
            image: true,
          },
        },
      },
      orderBy: {
        assignedAt: "asc",
      },
    }) as Promise<ClassRoomPersonnelWithUser[]>;
  },

  /**
   * Récupère toutes les classes d'un membre du personnel
   */
  async getPersonnelClassRooms(userId: string) {
    return prisma.classRoomPersonnel.findMany({
      where: { userId },
      include: {
        classRoom: {
          include: classRoomInclude,
        },
      },
      orderBy: {
        assignedAt: "asc",
      },
    });
  },
};
