import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import {
  getLatestDIS,
  recomputeDIS,
  getDISHistory,
  getDISGrowth,
  getWeights,
} from "@/controllers/disController";

const router = Router();
router.get("/weights", requireAuth, getWeights);
router.get("/:playerId", requireAuth, getLatestDIS);
router.get("/:playerId/history", requireAuth, getDISHistory);
router.get("/:playerId/growth", requireAuth, getDISGrowth);
router.post("/:playerId/recompute", requireAuth, requireRole("ADMIN", "COACH"), recomputeDIS);

export default router;
