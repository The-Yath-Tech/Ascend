import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { award, history, leaderboard } from "@/controllers/xpController";

const router = Router();
router.post("/", requireAuth, requireRole("ADMIN", "COACH"), award);
router.get("/leaderboard", requireAuth, leaderboard);
router.get("/:playerId/history", requireAuth, history);

export default router;
