import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import attendanceRoutes from "./routes/attendance.routes.js";
import superAdminRoutes from "./routes/superAdmin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import {
  PrismaClient,
  Role,
  AccountStatus,
  AttendanceStatus,
} from "@prisma/client";
import studentRoutes from "./routes/student.routes.js";
dotenv.config();
import antiSpoofRoutes from "./routes/antiSpoof.routes.js";
import audioRoutes from "./routes/audio.routes.js";

const app = express();

const port = Number(process.env.PORT || 5000);
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({
  extended: true,
  limit: "20mb",
}));
app.use("/api/attendance", attendanceRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/anti-spoof", antiSpoofRoutes);
app.use("/api/audio", audioRoutes);

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

async function ensureSeedData() {
  const superAdminEmail = "super@indira.edu";
  const superAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });
  if (!superAdmin) {
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: superAdminEmail,
        password: await hashPassword("super123"),
        role: Role.SUPER_ADMIN,
        status: AccountStatus.APPROVED,
        college: "Indira College",
        department: "Admin",
      },
    });
  }

  const adminEmail = "admin@indira.edu";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Prof. Sharma",
        email: adminEmail,
        password: await hashPassword("admin123"),
        role: Role.ADMIN,
        status: AccountStatus.APPROVED,
        college: "Indira College",
        department: "CSE",
      },
    });
  }

  const studentEmail = "student@indira.edu";
  const existingStudent = await prisma.user.findUnique({
    where: { email: studentEmail },
  });
  if (!existingStudent) {
    await prisma.user.create({
      data: {
        name: "Aarav",
        email: studentEmail,
        password: await hashPassword("student123"),
        role: Role.STUDENT,
        status: AccountStatus.APPROVED,
        college: "Indira College",
        course: "B.Tech",
        semester: "5",
        division: "A",
      },
    });
  }

  const existingSubjects = await prisma.subject.findMany();
  if (existingSubjects.length === 0) {
    await prisma.subject.createMany({
      data: [
        {
          name: "DBMS",
          semester: "5",
          college: "Indira College",
          department: "CSE",
        },
        {
          name: "Operating Systems",
          semester: "5",
          college: "Indira College",
          department: "CSE",
        },
      ],
    });
  }

  const existingClasses = await prisma.classModel.findMany();
  if (existingClasses.length === 0) {
    await prisma.classModel.createMany({
      data: [
        {
          name: "CSE-5A",
          college: "Indira College",
          department: "CSE",
          semester: "5",
          division: "A",
        },
        {
          name: "CSE-5B",
          college: "Indira College",
          department: "CSE",
          semester: "5",
          division: "B",
        },
      ],
    });
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// NOTE: /api/auth/login and /api/auth/admins were removed here —
// they were dead code, already handled by authRoutes -> auth.controller.ts

app.post("/api/auth/admin/register", async (req, res) => {
  const { name, email, password, college, department } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Admin already exists" });
  }

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role: Role.ADMIN,
      status: AccountStatus.PENDING,
      college,
      department,
    },
  });

  res
    .status(201)
    .json({ message: "Registration submitted successfully", admin });
});

app.get("/api/students", async (_req, res) => {
  const students = await prisma.user.findMany({ where: { role: Role.STUDENT } });
  res.json(students);
});

app.post("/api/auth/admin/:id/approve", async (req, res) => {
  const admin = await prisma.user.update({
    where: { id: req.params.id },
    data: { status: AccountStatus.APPROVED },
  });
  res.json({ message: "Admin approved", admin });
});

app.post("/api/auth/admin/:id/reject", async (req, res) => {
  const admin = await prisma.user.update({
    where: { id: req.params.id },
    data: { status: AccountStatus.REJECTED },
  });
  res.json({ message: "Admin rejected", admin });
});

app.get("/api/subjects", async (_req, res) => {
  const subjects = await prisma.subject.findMany();
  res.json(subjects);
});

app.post("/api/subjects", async (req, res) => {
  const subject = await prisma.subject.create({ data: req.body });
  res.status(201).json(subject);
});

app.get("/api/classes", async (_req, res) => {
  const classes = await prisma.classModel.findMany();
  res.json(classes);
});

app.post("/api/classes", async (req, res) => {
  const classItem = await prisma.classModel.create({ data: req.body });
  res.status(201).json(classItem);
});

async function startServer() {
  try {
    console.log("1. Starting server");

    console.log("2. Running ensureSeedData...");
    await ensureSeedData();
    console.log("3. ensureSeedData completed");

    console.log("4. Connecting Prisma...");
    await prisma.$connect();
    console.log("5. Prisma connected");

    console.log("6. Starting Express...");

    app.listen(port, () => {
      console.log(`AttendX backend running on http://127.0.0.1:${port}`);
      console.log(`AttendX backend also available on all network interfaces at port ${port}`);
    });
  } catch (err) {
    console.error("START SERVER ERROR:");
    console.error(err);
    process.exit(1);
  }
}

startServer();