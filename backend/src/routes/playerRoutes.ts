import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import {
  listPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayerDNA,
  updatePlayerDNA,
} from "@/controllers/playerController";

const router = Router();
router.get("/", requireAuth, listPlayers);
router.get("/:id", requireAuth, getPlayer);
router.post("/", requireAuth, requireRole("ADMIN", "COACH"), createPlayer);
router.patch("/:id", requireAuth, requireRole("ADMIN", "COACH"), updatePlayer);
router.delete("/:id", requireAuth, requireRole("ADMIN", "COACH"), deletePlayer);
router.get("/:id/dna", requireAuth, getPlayerDNA);
router.patch("/:id/dna", requireAuth, requireRole("ADMIN", "COACH"), updatePlayerDNA);

export default router;
