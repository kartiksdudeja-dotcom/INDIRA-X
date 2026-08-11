import { Router } from "express";
import * as studentController from "../controllers/student.controller.js";

const router = Router();

router.post("/register", studentController.registerStudent);
router.post("/login", studentController.loginStudent);

router.get(
  "/face-status/:studentId",
  studentController.faceStatus
);

router.post(
  "/register-face",
  studentController.registerFace
);

export default router;