import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { playerMonthlyReport, playerPassport, teamOverview } from "@/controllers/reportController";

const router = Router();
router.get("/player/:playerId/monthly", requireAuth, playerMonthlyReport);
router.get("/player/:playerId/passport", requireAuth, playerPassport);
router.get("/team/:teamId/overview", requireAuth, teamOverview);

export default router;
