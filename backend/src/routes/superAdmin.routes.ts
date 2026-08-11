import { Router } from "express";
import { getDashboard } from "../controllers/superAdmin.controller.js";

const router = Router();

router.get("/dashboard", getDashboard);

export default router;