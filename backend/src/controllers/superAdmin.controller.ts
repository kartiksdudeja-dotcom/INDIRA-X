import { Request, Response } from "express";
import * as superAdminService from "../services/superAdmin.service.js";

export const getDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await superAdminService.getDashboard();

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};