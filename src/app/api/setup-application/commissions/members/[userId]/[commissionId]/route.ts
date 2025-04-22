import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import {
  removeCommissionMember,
  updateCommissionMemberRole,
} from "@/lib/services/crud/commission.service";
import {
  successResponse,
  handleApiError,
  notFoundResponse,
} from "@/lib/services/api.service";

/**
 * PUT /api/commissions/members/[userId]/[commissionId] - Mettre à jour le rôle d'un membre
 */
export const PUT = withPrivilege(
  PrivilegeName.UPDATE_DATA,
  async (
    request: NextRequest,
    context: { params: Promise<{ userId: string; commissionId: string }> }
  ) => {
    try {
      const { userId, commissionId } = await context.params;

      // Récupérer les données du corps de la requête
      const data = await request.json();
      const { role } = data;
      
      if (!role) {
        return notFoundResponse("Le rôle est requis");
      }

      // Mettre à jour le rôle du membre
      const member = await updateCommissionMemberRole(
        userId,
        commissionId,
        role
      );

      // Retourner le membre mis à jour
      return successResponse({
        data: member,
        feedback: "Rôle du membre mis à jour avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la mise à jour du rôle du membre"
      );
    }
  }
);

/**
 * DELETE /api/commissions/members/[userId]/[commissionId] - Supprimer un membre d'une commission
 */
export const DELETE = withPrivilege(
  PrivilegeName.DELETE_DATA,
  async (
    request: NextRequest,
    context: { params: Promise<{ userId: string; commissionId: string }> }
  ) => {
    try {
      // Supprimer le membre de la commission
      const { userId, commissionId } = await context.params;
      await removeCommissionMember(userId, commissionId);

      // Retourner une réponse de succès
      return successResponse({
        feedback: "Membre supprimé de la commission avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la suppression du membre de la commission"
      );
    }
  }
); 