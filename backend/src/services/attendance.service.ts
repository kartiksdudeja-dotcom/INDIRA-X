import { PrismaClient, Role, SessionStatus } from "@prisma/client";
import { compareDescriptors } from "../utils/faceCompare.js";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000; // Earth radius in meters

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const startAttendance = async (data: any) => {
  const {
    college,
    course,
    semester,
    subject,
    division,
    teacherName,
    latitude,
    longitude,
    
  } = data;

  const subjectRecord =
    (await prisma.subject.findFirst({
      where: {
        name: subject,
        semester,
      },
    })) ??
    (await prisma.subject.create({
      data: {
        name: subject,
        semester,
        college,
        department: "CSE",
      },
    }));

  const classRecord =
    (await prisma.classModel.findFirst({
      where: {
        name: division,
        semester,
      },
    })) ??
    (await prisma.classModel.create({
      data: {
        name: division,
        college,
        department: "CSE",
        semester,
        division,
      },
    }));

  const teacher =
    (await prisma.user.findFirst({
      where: {
        role: Role.ADMIN,
        name: teacherName,
      },
    })) ??
    (await prisma.user.findFirst({
      where: {
        role: Role.ADMIN,
      },
    }));

  if (!teacher) {
    throw new Error("No teacher found");
  }

  const token = uuidv4();

  const session = await prisma.attendanceSession.create({
    data: {
      college,
      course,
      semester,
      division,

      collegeLatitude: latitude,
      collegeLongitude: longitude,
      allowedRadius: 100,

      subjectId: subjectRecord.id,
      teacherId: teacher.id,
      classId: classRecord.id,

      qrToken: token,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    },
    include: {
      subject: true,
      teacher: true,
      classModel: true,
    },
  });
  console.log("FRONTEND_URL:", process.env.FRONTEND_URL);



console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

const attendanceUrl = `${process.env.FRONTEND_URL}/attendance/${token}`;

console.log("Attendance URL:", attendanceUrl);

const qrDataUrl = await QRCode.toDataURL(attendanceUrl);

return {
  success: true,
  session,
  attendanceUrl,
  qrDataUrl,
};
}
export const getAttendanceSession = async (token: string) => {
  const session = await prisma.attendanceSession.findUnique({
    where: {
      qrToken: token,
    },
    include: {
      subject: true,
      teacher: true,
      classModel: true,
    },
  });

  if (!session) {
    throw new Error("Invalid QR Token");
  }

  if (session.status !== SessionStatus.ACTIVE) {
    throw new Error("Attendance Session Closed");
  }

  if (new Date() > session.expiresAt) {
    throw new Error("QR Expired");
  }

  return {
    success: true,
    session,
  };
};

export const markAttendance = async (data: any) => {
  const {
    studentId,
    studentName,
    sessionId,
    latitude,
    longitude,
    faceImage,
    faceDescriptor,
  } = data;
console.log("=========== FACE DEBUG ===========");
console.log("Student ID:", studentId);
  console.log("Session ID:", sessionId);
  console.log("Face Image Exists:", !!faceImage);
if (!faceImage) {
  throw new Error("Face image not received");
}

if (!faceDescriptor) {
  throw new Error("Face descriptor not received");
}

const student = await prisma.user.findUnique({
  where: {
    id: studentId,
  },
});

if (!student) {
  throw new Error("Student not found");
}

if (!student.faceDescriptor) {
  throw new Error("Student has no registered face");
}

const savedDescriptor = JSON.parse(student.faceDescriptor);

const faceDistance = compareDescriptors(
  savedDescriptor,
  faceDescriptor
);

console.log("Face Distance:", faceDistance);

if (faceDistance > 0.6) {
  throw new Error("Face Verification Failed");
}

console.log("Face image received");
console.log(faceImage.substring(0, 100));
  const session = await prisma.attendanceSession.findUnique({
    where: {
      id: sessionId,
    },
  });

  console.log("=========== GPS DEBUG ===========");
  console.log("Session:", session);
  console.log("Student Latitude:", latitude);
  console.log("Student Longitude:", longitude);

  if (!session) {
    throw new Error("Attendance Session Not Found");
  }

  console.log("Teacher Latitude:", session.collegeLatitude);
  console.log("Teacher Longitude:", session.collegeLongitude);

  if (session.status !== SessionStatus.ACTIVE) {
    throw new Error("Attendance Closed");
  }

  if (new Date() > session.expiresAt) {
    throw new Error("QR Expired");
  }

  if (
    session.collegeLatitude == null ||
    session.collegeLongitude == null
  ) {
    throw new Error("Teacher location not available");
  }

  const gpsDistance = getDistance(
  latitude,
  longitude,
  session.collegeLatitude,
  session.collegeLongitude
);

console.log("GPS Distance:", gpsDistance);
console.log("Allowed Radius:", session.allowedRadius);

if (gpsDistance > session.allowedRadius) {
  throw new Error(
    `Outside attendance area (${Math.round(gpsDistance)} meters away)`
  );
}

  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      studentId,
      sessionId,
    },
  });

  if (existingAttendance) {
    throw new Error("Attendance Already Marked");
  }

  const attendance = await prisma.attendance.create({
    data: {
      studentId,
      sessionId,
      latitude,
      longitude,
    },
  });

  return {
    success: true,
    message: "Attendance Marked Successfully",
    attendance,
    studentName,
  };
};
  
export const getAttendanceHistory = async () => {
  return prisma.attendance.findMany({
    include: {
      student: true,
      session: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getTodayAttendance = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.attendance.findMany({
    where: {
      createdAt: {
        gte: today,
      },
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          division: true,
          semester: true,
        },
      },
      session: {
        include: {
          subject: true,
          classModel: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getLiveAttendance = async (sessionId: string) => {
  const attendance = await prisma.attendance.findMany({
    where: {
      sessionId,
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          division: true,
          semester: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,
    attendance,
  };
};
