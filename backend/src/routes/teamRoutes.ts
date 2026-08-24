import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { listTeams, getTeam, createTeam, updateTeam, deleteTeam } from "@/controllers/teamController";

const router = Router();
router.get("/", requireAuth, listTeams);
router.get("/:id", requireAuth, getTeam);
router.post("/", requireAuth, requireRole("ADMIN", "COACH"), createTeam);
router.patch("/:id", requireAuth, requireRole("ADMIN", "COACH"), updateTeam);
router.delete("/:id", requireAuth, requireRole("ADMIN", "COACH"), deleteTeam);

export default router;
