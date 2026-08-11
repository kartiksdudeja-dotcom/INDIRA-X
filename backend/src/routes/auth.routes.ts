console.log("✅ auth.routes.ts loaded");

import { Router } from "express";
import {
  login,
  register,
  getAdmins,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/admins", getAdmins);
export default router;