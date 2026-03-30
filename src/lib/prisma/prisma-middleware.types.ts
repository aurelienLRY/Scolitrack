/**
 * Premier argument de `prisma.$use`.
 * Prisma 6 ne réexporte plus `Prisma.MiddlewareParams` sur le namespace `Prisma`.
 */
export type PrismaMiddlewareParams = {
  model?: string | null;
  action: string;
  args?: {
    data?: Record<string, unknown>;
    [key: string]: unknown;
  };
};
