import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma/prisma";
import {
  successResponse,
  handleApiError,
} from "@/lib/services/api.service";

/**
 * GET /api/families?q=...
 * Liste légère des familles (association dossier enrollment).
 */
export const GET = withPrivilege(
  PrivilegeName.MANAGE_ENROLLMENTS,
  async (request: NextRequest) => {
    try {
      const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
      const families = await prisma.family.findMany({
        where: q
          ? {
              OR: [
                { name: { contains: q } },
                { notes: { contains: q } },
              ],
            }
          : undefined,
        select: {
          id: true,
          name: true,
          _count: { select: { students: true } },
        },
        orderBy: { name: "asc" },
        take: 50,
      });

      return successResponse({
        data: families,
        feedback: "Familles récupérées",
      });
    } catch (error) {
      return handleApiError(error, "Erreur lors de la récupération des familles");
    }
  }
);
