import { Request, Response } from "express";
import * as antiSpoofService from "../services/antiSpoof.service.js";

export const checkSpoof = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("===== Anti Spoof API Called =====");
    console.log("Image exists:", !!req.body.image);
    console.log("Image length:", req.body.image?.length);
    console.log("Image preview:", req.body.image?.substring(0, 80));

    const result = await antiSpoofService.checkSpoof(req.body.image);

    res.json(result);
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};