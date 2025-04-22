import { prisma } from "@/lib/prisma/prisma";

/**
 * Service pour la gestion des rôles
 */
export const roleService = {
  /**
   * Récupère tous les rôles avec leurs privilèges
   */
  async getAllRoles() {
    return prisma.role.findMany({
      orderBy: { createdAt: "asc" },
      where: {
        name: {
          not: "SUPER_ADMIN",
        },
      },
      include: {
        rolePrivileges: {
          orderBy: { createdAt: "asc" },
          include: {
            privilege: true,
          },
        },
      },
    });
  },

  /**
   * Récupère un rôle par son ID avec ses privilèges
   */
  async getRoleById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        rolePrivileges: {
          include: {
            privilege: true,
          },
        },
      },
    });
  },

  /**
   * Récupère un rôle par son nom avec ses privilèges
   */
  async getRoleByName(name: string) {
    return prisma.role.findUnique({
      where: { name },
      include: {
        rolePrivileges: {
          include: {
            privilege: true,
          },
        },
      },
    });
  },

  /**
   * Crée un nouveau rôle avec ses privilèges associés
   */
  async createRole(data: {
    name: string;
    description?: string;
    privilegeIds?: string[];
  }) {
    const { name, description, privilegeIds = [] } = data;

    // Vérifier si le nom du rôle existe déjà
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new Error(`Le rôle "${name}" existe déjà.`);
    }

    const preName = name.toUpperCase().replace(/ /g, "_");

    return prisma.$transaction(async (tx) => {
      // Créer le rôle
      const role = await tx.role.create({
        data: {
          name: preName,
          description,
          isPermanent: false,
        },
      });

      // Associer les privilèges au rôle
      if (privilegeIds.length > 0) {
        await Promise.all(
          privilegeIds.map((privilegeId) =>
            tx.rolePrivilege.create({
              data: {
                roleId: role.id,
                privilegeId,
              },
            })
          )
        );
      }

      // Retourner le rôle avec ses privilèges
      return tx.role.findUnique({
        where: { id: role.id },
        include: {
          rolePrivileges: {
            include: {
              privilege: true,
            },
          },
        },
      });
    });
  },

  /**
   * Met à jour un rôle et ses privilèges associés
   */
  async updateRole(
    id: string,
    data: { name?: string; description?: string; privilegeIds?: string[] }
  ) {
    const { name, description, privilegeIds } = data;

    const preName = name?.toUpperCase().replace(/ /g, "_");

    // Vérifier si le rôle existe
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePrivileges: true,
      },
    });

    if (!role) {
      throw new Error("Rôle introuvable.");
    }

    // Vérifier si le rôle est permanent et si on essaie de changer son nom
    if (role.isPermanent && name && name !== role.name) {
      throw new Error("Impossible de modifier le nom d'un rôle permanent.");
    }

    // Si le nouveau nom est différent, vérifier s'il existe déjà
    if (name && name !== role.name) {
      const existingRole = await prisma.role.findUnique({
        where: { name: preName },
      });

      if (existingRole) {
        throw new Error(`Le rôle "${name}" existe déjà.`);
      }
    }

    return prisma.$transaction(async (tx) => {
      // Mettre à jour le rôle
      await tx.role.update({
        where: { id },
        data: {
          name: preName,
          description,
        },
      });

      // Si des privilegeIds sont fournis, mettre à jour les associations
      if (privilegeIds) {
        // Supprimer toutes les associations actuelles
        await tx.rolePrivilege.deleteMany({
          where: { roleId: id },
        });

        // Créer les nouvelles associations
        await Promise.all(
          privilegeIds.map((privilegeId) =>
            tx.rolePrivilege.create({
              data: {
                roleId: id,
                privilegeId,
              },
            })
          )
        );
      }

      // Retourner le rôle mis à jour avec ses privilèges
      return tx.role.findUnique({
        where: { id },
        include: {
          rolePrivileges: {
            include: {
              privilege: true,
            },
          },
        },
      });
    });
  },

  /**
   * Supprime un rôle et réassigne les utilisateurs au rôle USER
   */
  async deleteRole(id: string) {
    // Vérifier si le rôle existe
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new Error("Rôle introuvable.");
    }

    // Vérifier si le rôle est permanent
    if (role.isPermanent) {
      throw new Error("Impossible de supprimer un rôle permanent.");
    }

    // Récupérer le rôle USER
    const userRole = await prisma.role.findUnique({
      where: { name: "USER" },
    });

    if (!userRole) {
      throw new Error("Rôle USER introuvable. Opération impossible.");
    }

    return prisma.$transaction(async (tx) => {
      // Réassigner tous les utilisateurs du rôle à supprimer vers le rôle USER
      await tx.user.updateMany({
        where: { roleName: role.name },
        data: { roleName: "USER" },
      });

      // Supprimer toutes les associations de privilèges pour ce rôle
      await tx.rolePrivilege.deleteMany({
        where: { roleId: id },
      });

      // Supprimer le rôle
      return tx.role.delete({
        where: { id },
      });
    });
  },

  /**
   * Vérifie si un utilisateur possède un privilège spécifique
   */
  async hasPrivilege(userId: string, privilegeName: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePrivileges: {
              include: {
                privilege: true,
              },
            },
          },
        },
      },
    });

    if (!user) return false;

    // Si l'utilisateur est SUPER_ADMIN, il a tous les privilèges
    if (user.roleName === "SUPER_ADMIN") return true;

    // Vérifier si l'utilisateur a le privilège spécifié
    return user.role.rolePrivileges.some(
      (rp) => rp.privilege.name === privilegeName
    );
  },

  /**
   * Assigne un rôle à un utilisateur
   */
  async assignRoleToUser(userId: string, roleName: string) {
    // Vérifier si le rôle existe
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Le rôle "${roleName}" n'existe pas.`);
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Utilisateur introuvable.");
    }

    // Vérifier si le rôle est SUPER_ADMIN, et si oui, vérifier qu'aucun autre utilisateur n'a déjà ce rôle
    if (roleName === "SUPER_ADMIN") {
      const existingSuperAdmin = await prisma.user.findFirst({
        where: { roleName: "SUPER_ADMIN" },
      });

      if (existingSuperAdmin && existingSuperAdmin.id !== userId) {
        throw new Error("Un seul utilisateur peut avoir le rôle SUPER_ADMIN.");
      }
    }

    // Assigner le rôle
    return prisma.user.update({
      where: { id: userId },
      data: { roleName },
      include: {
        role: {
          include: {
            rolePrivileges: {
              include: {
                privilege: true,
              },
            },
          },
        },
      },
    });
  },
};
