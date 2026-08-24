import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { analyzeSessionVideo } from "@/controllers/visionController";

const router = Router();
router.post("/analyze", requireAuth, requireRole("ADMIN", "COACH"), analyzeSessionVideo);

export default router;
