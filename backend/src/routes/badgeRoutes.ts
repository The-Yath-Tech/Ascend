import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { listBadges, createBadge, awardBadge, listPlayerBadges } from "@/controllers/badgeController";

const router = Router();
router.get("/", requireAuth, listBadges);
router.post("/", requireAuth, requireRole("ADMIN", "COACH"), createBadge);
router.post("/award", requireAuth, requireRole("ADMIN", "COACH"), awardBadge);
router.get("/player/:playerId", requireAuth, listPlayerBadges);

export default router;
