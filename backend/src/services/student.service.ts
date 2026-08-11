import {
  PrismaClient,
  Role,
  AccountStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
export const faceStatus = async (studentId: string) => {
  const student = await prisma.user.findUnique({
    where: {
      id: studentId,
    },
    select: {
      name: true,
      faceDescriptor: true,
    },
  });

  console.log("========== FACE STATUS ==========");
  console.log("Student ID:", studentId);
  console.log("Student:", student);
  console.log("Face Descriptor:", student?.faceDescriptor);
  console.log("Registered:", !!student?.faceDescriptor);

  return {
    success: true,
    studentName: student?.name,
    registered: !!student?.faceDescriptor,
  };
};
export const registerFace = async (
  studentId: string,
  image: string,
  descriptor: number[]
) => {

  if (!descriptor || descriptor.length === 0) {
    throw new Error("Face descriptor not found");
  }

  // SAVE TO DATABASE
  await prisma.user.update({
    where: {
      id: studentId,
    },
    data: {
      faceImage: image,
      faceDescriptor: JSON.stringify(descriptor),
    },
  });

  // READ AGAIN TO VERIFY
  const updatedUser = await prisma.user.findUnique({
    where: {
      id: studentId,
    },
    select: {
      faceDescriptor: true,
    },
  });

  console.log("========== REGISTER FACE ==========");
  console.log("Student ID:", studentId);
  console.log("Saved Descriptor:", updatedUser?.faceDescriptor);
  console.log("Length:", updatedUser?.faceDescriptor?.length);

  return {
    success: true,
    message: "Face registered successfully",
  };
};
export const registerStudent = async (data: any) => {
  const {
    name,
    email,
    password,
    college,
    department,
    course,
    semester,
    division,
    faceImage,
     faceDescriptor,
  } = data;
console.log("Face Image Received:", !!faceImage);

if (faceImage) {
  console.log(faceImage.substring(0, 80));
}
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
console.log("Face Image:", !!faceImage);
console.log("Descriptor:", !!faceDescriptor);

console.log("Descriptor Length:", faceDescriptor?.length);
  const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    role: Role.STUDENT,
    status: AccountStatus.APPROVED,
    college,
    department,
    course,
    semester,
    division,
    faceImage,
     faceDescriptor: JSON.stringify(faceDescriptor),
  },
});

  const { password: _, ...safeUser } = user;

  return {
    success: true,
    message: "Student Registered Successfully",
    user: safeUser,
  };
};

export const loginStudent = async (
  email: string,
  password: string
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Student not found");
  }

  if (user.role !== Role.STUDENT) {
    throw new Error("Invalid Student Account");
  }

  const validPassword = await bcrypt.compare(
    password,
    user.password
  );

  if (!validPassword) {
    throw new Error("Invalid Password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET || "attendx-secret",
    {
      expiresIn: "7d",
    }
  );

  const { password: _, ...safeUser } = user;

  return {
    success: true,
    token,
    user: safeUser,
  };
};