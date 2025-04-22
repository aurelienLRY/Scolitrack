import { prisma } from "@/lib/prisma/prisma";
import { 
  CommissionFormData, 
  CommissionUpdateFormData,
  CommissionMemberFormData
} from "@/schemas/commissionSchema";
import { Commission, CommissionMember } from "@prisma/client";
import { TCommissionWithAllRelations } from "@/types/commission.type";


/**
 * Récupère toutes les commissions
 */
export async function getAllCommissions(): Promise<TCommissionWithAllRelations[]> {
  return prisma.commission.findMany({
    include: {
      members: {
        include: {
          user: true,
        },
      },
      establishment: true,
    },
  });
}

/**
 * Récupère les commissions d'un établissement
 */
export async function getCommissionsByEstablishment(
  establishmentId: string
): Promise<TCommissionWithAllRelations[]> {
  return prisma.commission.findMany({
    where: { establishmentId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      establishment: true,
    },
  });
}

/**
 * Récupère une commission par son ID
 */
export async function getCommissionById(
  id: string
): Promise<TCommissionWithAllRelations | null> {
  return prisma.commission.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      establishment: true,
    },
  });
}

/**
 * Crée une nouvelle commission
 */
export async function createCommission(
  data: CommissionFormData
): Promise<TCommissionWithAllRelations> {
  // Extraire establishmentId pour utiliser la syntaxe de relation correcte
  const { establishmentId, ...commissionData } = data;

  return prisma.commission.create({
    data: {
      ...commissionData,
      establishment: {
        connect: { id: establishmentId },
      },
    },
    include: {
      establishment: true,
      members: {
        include: {
          user: true,
        },
      },
    },
  });
}

/**
 * Met à jour une commission existante
 */
export async function updateCommission(
  id: string,
  data: CommissionUpdateFormData
): Promise<Commission> {
  // Extraire establishmentId pour utiliser la syntaxe de relation correcte
  const { establishmentId, ...commissionData } = data;

  // Préparer l'objet de données pour la mise à jour avec le type correct pour Prisma
  type CommissionUpdateInput = Omit<
    CommissionUpdateFormData,
    "establishmentId"
  > & {
    establishment?: {
      connect: { id: string };
    };
  };

  const updateData: CommissionUpdateInput = { ...commissionData };

  // Si establishmentId est fourni, utiliser la syntaxe connect pour la relation
  if (establishmentId) {
    updateData.establishment = {
      connect: { id: establishmentId },
    };
  }

  return prisma.commission.update({
    where: { id },
    data: updateData,
    include: {
      establishment: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Supprime une commission
 */
export async function deleteCommission(id: string): Promise<Commission> {
  return prisma.commission.delete({
    where: { id },
  });
}

/**
 * Récupère les commissions auxquelles appartient un utilisateur
 */
export async function getUserCommissions(userId: string): Promise<TCommissionWithAllRelations[]> {
  return prisma.commission.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
          },
        },   
      establishment: true,
    },
  });
}

/**
 * Ajoute un membre à une commission
 */
export async function addCommissionMember(
  data: CommissionMemberFormData
): Promise<CommissionMember> {
  return prisma.commissionMember.create({
    data,
    include: {
        user: true,
        commission: true,
    },
  });
}

/**
 * Supprime un membre d'une commission
 */
export async function removeCommissionMember(
  userId: string,
  commissionId: string
): Promise<CommissionMember> {
  return prisma.commissionMember.delete({
    where: {
      userId_commissionId: {
        userId,
        commissionId,
      },
    },
  });
}

/**
 * Met à jour le rôle d'un membre dans une commission
 */
export async function updateCommissionMemberRole(
  userId: string,
  commissionId: string,
  role: string
): Promise<CommissionMember> {
  return prisma.commissionMember.update({
    where: {
      userId_commissionId: {
        userId,
        commissionId,
      },
    },
    data: {
      role,
    },
  });
} 