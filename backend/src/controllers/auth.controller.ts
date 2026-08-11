import { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  
};

export const getAdmins = async (_req: Request, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: Role.ADMIN,
      },
    });

    res.json(admins);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};