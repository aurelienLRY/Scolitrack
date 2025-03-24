import { prisma } from "@/lib/prisma";

/**
 * Service pour la gestion des privilèges
 */
export const privilegeService = {
  /**
   * Récupère tous les privilèges
   */
  async getAllPrivileges() {
    return prisma.privilege.findMany({
      orderBy: { name: "asc" },
    });
  },

  /**
   * Récupère un privilège par son ID
   */
  async getPrivilegeById(id: string) {
    return prisma.privilege.findUnique({
      where: { id },
      include: {
        rolePrivileges: {
          include: {
            role: true,
          },
        },
      },
    });
  },

  /**
   * Récupère un privilège par son nom
   */
  async getPrivilegeByName(name: string) {
    return prisma.privilege.findUnique({
      where: { name },
      include: {
        rolePrivileges: {
          include: {
            role: true,
          },
        },
      },
    });
  },

  /**
   * Récupère les privilèges d'un rôle par son ID
   */
  async getPrivilegesByRoleId(roleId: string) {
    const roleWithPrivileges = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePrivileges: {
          include: {
            privilege: true,
          },
        },
      },
    });

    if (!roleWithPrivileges) {
      return [];
    }

    return roleWithPrivileges.rolePrivileges.map((rp) => rp.privilege);
  },

  /**
   * Récupère les privilèges d'un rôle par son nom
   */
  async getPrivilegesByRoleName(roleName: string) {
    const roleWithPrivileges = await prisma.role.findUnique({
      where: { name: roleName },
      include: {
        rolePrivileges: {
          include: {
            privilege: true,
          },
        },
      },
    });

    if (!roleWithPrivileges) {
      return [];
    }

    return roleWithPrivileges.rolePrivileges.map((rp) => rp.privilege);
  },
};
