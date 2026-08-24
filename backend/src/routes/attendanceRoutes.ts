import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import {
  markAttendance,
  sessionAttendance,
  playerAttendanceHistory,
} from "@/controllers/attendanceController";

const router = Router();
router.post("/", requireAuth, requireRole("ADMIN", "COACH"), markAttendance);
router.get("/session/:sessionId", requireAuth, sessionAttendance);
router.get("/player/:playerId", requireAuth, playerAttendanceHistory);

export default router;
