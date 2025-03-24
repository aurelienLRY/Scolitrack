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

  /**
   * Crée un nouveau privilège
   * Ajoute automatiquement le privilège au rôle SUPER_ADMIN
   */
  async createPrivilege(data: { name: string; description?: string }) {
    const { name, description } = data;

    // Vérifier si le nom du privilège existe déjà
    const existingPrivilege = await prisma.privilege.findUnique({
      where: { name },
    });

    if (existingPrivilege) {
      throw new Error(`Le privilège "${name}" existe déjà.`);
    }

    const preName = name.toUpperCase().replace(/ /g, "_");

    return prisma.$transaction(async (tx) => {
      // Créer le privilège
      const privilege = await tx.privilege.create({
        data: {
          name: preName,
          description,
        },
      });

      // Ajouter automatiquement ce privilège au rôle SUPER_ADMIN
      const superAdminRole = await tx.role.findUnique({
        where: { name: "SUPER_ADMIN" },
      });

      if (superAdminRole) {
        await tx.rolePrivilege.create({
          data: {
            roleId: superAdminRole.id,
            privilegeId: privilege.id,
          },
        });
      }

      return privilege;
    });
  },

  /**
   * Met à jour un privilège
   */
  async updatePrivilege(
    id: string,
    data: { name?: string; description?: string }
  ) {
    const { name, description } = data;

    // Vérifier si le privilège existe
    const privilege = await prisma.privilege.findUnique({
      where: { id },
    });

    if (!privilege) {
      throw new Error("Privilège introuvable.");
    }

    const preName = name?.toUpperCase().replace(/ /g, "_");

    // Si le nouveau nom est différent, vérifier s'il existe déjà
    if (name && name !== privilege.name) {
      const existingPrivilege = await prisma.privilege.findUnique({
        where: { name: preName },
      });

      if (existingPrivilege) {
        throw new Error(`Le privilège "${name}" existe déjà.`);
      }
    }

    // Mettre à jour le privilège
    return prisma.privilege.update({
      where: { id },
      data: {
        name: preName,
        description,
      },
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
   * Supprime un privilège
   */
  async deletePrivilege(id: string) {
    // Vérifier si le privilège existe
    const privilege = await prisma.privilege.findUnique({
      where: { id },
    });

    if (!privilege) {
      throw new Error("Privilège introuvable.");
    }

    return prisma.$transaction(async (tx) => {
      // Supprimer toutes les associations avec les rôles
      await tx.rolePrivilege.deleteMany({
        where: { privilegeId: id },
      });

      // Supprimer le privilège
      return tx.privilege.delete({
        where: { id },
      });
    });
  },
};
