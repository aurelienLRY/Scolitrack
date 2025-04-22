import { prisma } from "@/lib/prisma/prisma";
import { User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";
import { CreateUserSchemaType } from "@/schemas/UserSchema";
import { sendAccountActivationEmail } from "@/lib/nodemailer/account-activation.email";

/**
 * Crée un nouvel utilisateur non activé et envoie un email d'activation
 * @param userData - Données du nouvel utilisateur
 * @returns User - L'utilisateur créé
 */
export async function createUser(
  userData: CreateUserSchemaType
): Promise<User> {
  // Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new Error("Cet email est déjà utilisé");
  }

  // Générer un token d'activation (UUID)
  const activationToken = uuidv4();

  // Générer une date d'expiration (72 heures)
  const tokenExpiry = new Date();
  tokenExpiry.setHours(tokenExpiry.getHours() + 72);

  // Créer l'utilisateur sans mot de passe
  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      role: {
        connect: {
          id: userData.role,
        },
      },
      resetToken: activationToken,
      resetTokenExpiry: tokenExpiry,
    },
  });

  // Envoyer l'email d'activation
  await sendAccountActivationEmail(
    user.email,
    user.name || user.email,
    activationToken
  );

  return user;
}

/**
 * Active un compte utilisateur avec un token et définit son mot de passe
 * @param token - Token d'activation
 * @param password - Nouveau mot de passe
 * @returns User - L'utilisateur activé
 */
export async function activateAccount(
  token: string,
  password: string
): Promise<User> {
  // Trouver l'utilisateur avec le token
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error("Token invalide ou expiré");
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Mettre à jour l'utilisateur avec le mot de passe et marquer comme vérifié
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      emailVerified: new Date(),
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return updatedUser;
}

/**
 * Récupère la liste des utilisateurs avec pagination
 * @param page - Numéro de page
 * @param limit - Nombre d'éléments par page
 * @returns Liste des utilisateurs paginée
 */
export async function getUsers(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({

      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}

/**
 * Récupère les utilisateurs par leur rôle
 * @param role - Rôle à rechercher
 * @returns Liste des utilisateurs avec le rôle spécifié
 */
export async function getUserByRole(role: string) {
  const users = await prisma.user.findMany({
    where: {
      roleName: role,
    },
  });

  return users;
}
