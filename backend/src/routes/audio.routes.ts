import { Router } from "express";
import {
  generateAudioToken,
  verifyAudioToken,
} from "../services/audio.service.js";

const router = Router();

router.get("/generate", (req, res) => {
  res.json(generateAudioToken());
});

router.post("/verify", (req, res) => {
  const { token } = req.body;

  res.json({
    success: verifyAudioToken(token),
  });
});

export default router;