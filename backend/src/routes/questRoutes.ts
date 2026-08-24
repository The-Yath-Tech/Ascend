import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { listQuests, createQuest, completeQuest } from "@/controllers/questController";

const router = Router();
router.get("/", requireAuth, listQuests);
router.post("/", requireAuth, requireRole("ADMIN", "COACH"), createQuest);
router.post("/:id/complete", requireAuth, requireRole("ADMIN", "COACH"), completeQuest);

export default router;
