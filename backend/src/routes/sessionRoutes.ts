import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import {
  listSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
} from "@/controllers/sessionController";

const router = Router();
router.get("/", requireAuth, listSessions);
router.get("/:id", requireAuth, getSession);
router.post("/", requireAuth, requireRole("ADMIN", "COACH"), createSession);
router.patch("/:id", requireAuth, requireRole("ADMIN", "COACH"), updateSession);
router.delete("/:id", requireAuth, requireRole("ADMIN", "COACH"), deleteSession);

export default router;
