"use server";
import { handlers } from "@/lib/auth/auth";
/**
 * Route pour l'authentification NextAuth
 *
 * Cette route gère les requêtes GET et POST pour l'authentification.
 * Elle utilise le gestionnaire d'authentification NextAuth configuré dans @/lib/auth/auth.ts.
 */
export const { GET, POST } = handlers;
