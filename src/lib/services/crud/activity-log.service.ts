import { prisma } from "@/lib/prisma/prisma";
import { auth } from "@/lib/auth/auth";

export interface ActivityLogData {
  userId?: string;
  action: string;
  details?: string;
}

export interface ActivityLogWithUser {
  id: string;
  userId: string;
  action: string;
  details?: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export const activityLogService = {
  /**
   * Enregistre une activité dans le journal
   */
  async logActivity(data: ActivityLogData) {
    try {
      const session = await auth();
      const userId = session?.user?.id;
    
      return prisma.activityLog.create({
        data: {
          ...data,
          userId: userId || data.userId || "Non identifié",
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'activité:", error);
      // Ne pas échouer l'opération principale si la journalisation échoue
      return null;
    }
  },

  /**
   * Récupère toutes les activités
   */
  async getAllActivities() {
    return prisma.activityLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Récupère les activités d'un utilisateur spécifique
   */
  async getUserActivities(userId: string) {
    return prisma.activityLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Récupère les activités par type
   */
  async getActivitiesByAction(action: string) {
    return prisma.activityLog.findMany({
      where: {
        action,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Récupère les activités d'un utilisateur par type
   */
  async getUserActivitiesByAction(userId: string, action: string) {
    return prisma.activityLog.findMany({
      where: {
        userId,
        action,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },
};
