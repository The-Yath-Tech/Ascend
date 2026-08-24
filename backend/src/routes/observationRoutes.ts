import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { listObservations, createObservation } from "@/controllers/observationController";

const router = Router();
router.get("/player/:playerId", requireAuth, listObservations);
router.post("/", requireAuth, requireRole("ADMIN", "COACH"), createObservation);

export default router;
