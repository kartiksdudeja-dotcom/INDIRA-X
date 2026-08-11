import { Router } from "express";
import { checkSpoof } from "../controllers/antiSpoof.controller.js";

const router = Router();

router.post("/check", checkSpoof);

export default router;