import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { listMatches, getMatch, createMatch, updateMatch } from "@/controllers/matchController";

const router = Router();
router.get("/", requireAuth, listMatches);
router.get("/:id", requireAuth, getMatch);
router.post("/", requireAuth, requireRole("ADMIN", "COACH"), createMatch);
router.patch("/:id", requireAuth, requireRole("ADMIN", "COACH"), updateMatch);

export default router;
