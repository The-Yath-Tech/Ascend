import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { analyzeAndApply } from "@/controllers/aiController";

const router = Router();
router.post("/session-note", requireAuth, requireRole("ADMIN", "COACH"), analyzeAndApply);

export default router;
