import { Request, Response } from "express";
import * as attendanceService from "../services/attendance.service.js";

export const startAttendance = async (req: Request, res: Response) => {
  try {
    console.log("REQ BODY:", req.body);

const result = await attendanceService.startAttendance(req.body);
    res.status(201).json(result);
  } catch (error: any) {
  console.error("========== MARK ATTENDANCE ERROR ==========");
  console.error(error);

  res.status(500).json({
    success: false,
    message: error.message,
    stack: error.stack,
  });
}
};

export const getAttendanceSession = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("REQ BODY:", req.body);
    const token = req.params.token as string;

const result = await attendanceService.getAttendanceSession(token);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await attendanceService.markAttendance(req.body);
    res.json(result);
  } catch (error: any) {
    console.error("=========== ERROR ===========");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export const getAttendanceHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await attendanceService.getAttendanceHistory();

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTodayAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await attendanceService.getTodayAttendance();

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLiveAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await attendanceService.getLiveAttendance(
      req.params.sessionId as string
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};