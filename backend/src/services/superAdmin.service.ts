import { PrismaClient, Role, AccountStatus, SessionStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboard = async () => {
  const superAdmins = await prisma.user.count({
    where: { role: Role.SUPER_ADMIN },
  });

  const admins = await prisma.user.count({
    where: { role: Role.ADMIN },
  });

  const pendingAdmins = await prisma.user.count({
    where: { role: Role.ADMIN, status: AccountStatus.PENDING },
  });

  const students = await prisma.user.count({
    where: { role: Role.STUDENT },
  });

  const subjects = await prisma.subject.count();

  const classes = await prisma.classModel.count();

  const activeSessions = await prisma.attendanceSession.count({
    where: {
      status: SessionStatus.ACTIVE,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAttendance = await prisma.attendance.count({
    where: {
      createdAt: {
        gte: today,
      },
    },
  });

  return {
    success: true,
    data: {
      superAdmins,
      admins,
      students,
      subjects,
      classes,
      activeSessions,
      todayAttendance,
    },
  };
};