// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  PrivilegeName,
  PRIVILEGES,
  ADMIN_EXCLUDED_PRIVILEGES,
  RoleDefinition,
} from "@/config/privileges.config";

const prisma = new PrismaClient();

async function main() {
  // Créer les rôles permanents
  const roles: RoleDefinition[] = [
    {
      name: "SUPER_ADMIN",
      isPermanent: true,
      description: "Super administrateur avec tous les privilèges",
    },
    {
      name: "ADMIN",
      isPermanent: true,
      description: "Administrateur avec des privilèges limités",
    },
    {
      name: "USER",
      isPermanent: true,
      description: "Utilisateur standard avec des privilèges minimaux",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: {
        name: role.name,
        isPermanent: role.isPermanent,
        description: role.description,
      },
    });
    console.log(`Rôle ${role.name} créé ou maintenu.`);
  }

  // Créer des privilèges de base à partir des constantes partagées
  for (const privilege of PRIVILEGES) {
    await prisma.privilege.upsert({
      where: { name: privilege.name },
      update: {},
      create: {
        name: privilege.name,
        description: privilege.description,
      },
    });
    console.log(`Privilège ${privilege.name} créé ou maintenu.`);
  }

  // Récupérer le rôle SUPER_ADMIN
  const superAdminRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });

  // Récupérer le rôle ADMIN
  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  // Récupérer tous les privilèges
  const allPrivileges = await prisma.privilege.findMany();

  // Attribuer tous les privilèges au SUPER_ADMIN
  if (superAdminRole) {
    for (const privilege of allPrivileges) {
      await prisma.rolePrivilege.upsert({
        where: {
          roleId_privilegeId: {
            roleId: superAdminRole.id,
            privilegeId: privilege.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          privilegeId: privilege.id,
        },
      });
    }
    console.log("Tous les privilèges attribués au SUPER_ADMIN.");
  }

  // Attribuer certains privilèges à ADMIN (tous sauf ceux exclus)
  if (adminRole) {
    const adminPrivileges = allPrivileges.filter(
      (p) => !ADMIN_EXCLUDED_PRIVILEGES.includes(p.name as PrivilegeName)
    );

    for (const privilege of adminPrivileges) {
      await prisma.rolePrivilege.upsert({
        where: {
          roleId_privilegeId: {
            roleId: adminRole.id,
            privilegeId: privilege.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          privilegeId: privilege.id,
        },
      });
    }
    console.log("Privilèges nécessaires attribués à ADMIN.");
  }

  // Créer un super administrateur si nécessaire
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@scolitrack.com";

  // Vérifier si un super admin existe déjà
  const superAdminExists = await prisma.user.findFirst({
    where: {
      email: adminEmail,
      roleName: "SUPER_ADMIN",
    },
  });

  if (!superAdminExists && superAdminRole) {
    const hashedPassword = await bcrypt.hash(
      process.env.SUPER_ADMIN_PASSWORD || "admin@scolitrack.com",
      10
    );

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Super Admin",
        password: hashedPassword,
        roleName: "SUPER_ADMIN",
        emailVerified: new Date(),
      },
    });
    console.log("Utilisateur Super Admin par défaut créé.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
