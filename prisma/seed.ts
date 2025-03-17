// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  const adminEmail =
    process.env.SUPER_ADMIN_EMAIL || ("admin@admin.com" as string);
  // Vérifier si un utilisateur admin existe déjà
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(
      process.env.SUPER_ADMIN_PASSWORD as string,
      10
    );
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Super Admin",
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });
    console.log("Utilisateur administrateur par défaut créé.");
  }
}
main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
