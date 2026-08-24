import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import {
  listGoals,
  createGoal,
  updateGoalStatus,
  deleteGoal,
  goalAchievementRate,
} from "@/controllers/goalController";

const router = Router();
router.get("/", requireAuth, listGoals);
router.post("/", requireAuth, requireRole("ADMIN", "COACH"), createGoal);
router.patch("/:id/status", requireAuth, requireRole("ADMIN", "COACH", "PLAYER"), updateGoalStatus);
router.delete("/:id", requireAuth, requireRole("ADMIN", "COACH"), deleteGoal);
router.get("/player/:playerId/rate", requireAuth, goalAchievementRate);

export default router;
