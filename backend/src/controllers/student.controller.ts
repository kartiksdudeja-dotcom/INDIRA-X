import { Request, Response } from "express";
import * as studentService from "../services/student.service.js";

export const faceStatus = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId as string;

    console.log("========== FACE STATUS ==========");
    console.log("Student ID:", studentId);

    const result = await studentService.faceStatus(studentId);

    console.log("Result:", result);

    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const registerFace = async (req: Request, res: Response) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("Student ID:", req.body.studentId);
    console.log("Image Exists:", !!req.body.image);
    console.log("Descriptor Length:", req.body.descriptor?.length);

    const { studentId, image, descriptor } = req.body;

    const result = await studentService.registerFace(
      studentId,
      image,
      descriptor
    );

    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const result = await studentService.registerStudent(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await studentService.loginStudent(email, password);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};