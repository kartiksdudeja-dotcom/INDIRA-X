import { PrismaClient, Role, AccountStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
export const register = async (data: any) => {
  const {
    name,
    email,
    password,
    college,
    department,
    course,
    semester,
    division,
  } = data;

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: Role.ADMIN,
      status: AccountStatus.PENDING,
      college,
      department,
      course,
      semester,
      division,
    },
  });

  const { password: _, ...safeUser } = user;

  return {
    success: true,
    message: "Registration successful. Waiting for Super Admin approval.",
    user: safeUser,
  };
};
export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid Email");
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new Error("Invalid Password");
  }

  if (user.role === Role.STUDENT) {
    throw new Error("Students cannot login here.");
  }

  if (user.role === Role.ADMIN && user.status === AccountStatus.PENDING) {
    throw new Error("Account is pending approval");
  }

  if (user.role === Role.ADMIN && user.status === AccountStatus.REJECTED) {
    throw new Error("Account was rejected");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "attendx-secret",
    { expiresIn: "7d" }
  );

  const { password: _, ...safeUser } = user;

  return {
    success: true,
    token,
    user: safeUser,
  };
};