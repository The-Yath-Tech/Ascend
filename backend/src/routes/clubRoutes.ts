import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { listClubs, getClub, createClub, updateClub, deleteClub } from "@/controllers/clubController";

const router = Router();
router.get("/", requireAuth, listClubs);
router.get("/:id", requireAuth, getClub);
router.post("/", requireAuth, requireRole("ADMIN"), createClub);
router.patch("/:id", requireAuth, requireRole("ADMIN"), updateClub);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteClub);

export default router;
