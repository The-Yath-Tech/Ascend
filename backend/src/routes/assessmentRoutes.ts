import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { listAssessments, createAssessment } from "@/controllers/assessmentController";

const router = Router();
router.get("/", requireAuth, listAssessments);
router.post("/", requireAuth, requireRole("ADMIN", "COACH"), createAssessment);

export default router;
