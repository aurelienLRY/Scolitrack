/**
 * Prisma client pour l'authentification.
 *
 * On réutilise le client étendu (déjà chargé avec la logique crypto côté Prisma)
 * afin que les champs chiffrés soient bien déchiffrés au moment de la lecture.
 */
import { prisma } from "./prisma";

export const prismaForAuth = prisma;
