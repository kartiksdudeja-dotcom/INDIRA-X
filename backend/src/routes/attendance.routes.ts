import { Router } from "express";
console.log("✅ Attendance routes loaded");
import {
  startAttendance,
  getAttendanceSession,
  markAttendance,
  getAttendanceHistory,
  getTodayAttendance,
  getLiveAttendance,
} from "../controllers/attendance.controller.js";

const router = Router();

router.post("/start", startAttendance);

router.get("/session/:token", getAttendanceSession);

router.post("/mark", markAttendance);

router.get("/history", getAttendanceHistory);
router.get("/today", getTodayAttendance);

router.get("/live/:sessionId", getLiveAttendance);

export default router;