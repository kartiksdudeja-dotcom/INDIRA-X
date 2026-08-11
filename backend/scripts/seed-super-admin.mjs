import { PrismaClient, Role, AccountStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = "super@indira.edu";
const password = "super123";

const existing = await prisma.user.findUnique({ where: { email } });
if (!existing) {
  const user = await prisma.user.create({
    data: {
      name: "Super Admin",
      email,
      password: await bcrypt.hash(password, 10),
      role: Role.SUPER_ADMIN,
      status: AccountStatus.APPROVED,
      college: "Indira College",
      department: "Admin",
    },
  });
  console.log(
    JSON.stringify({ created: true, id: user.id, email: user.email, password }),
  );
} else {
  console.log(
    JSON.stringify({
      created: false,
      id: existing.id,
      email: existing.email,
      password,
    }),
  );
}

await prisma.$disconnect();
