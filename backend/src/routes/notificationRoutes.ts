import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { listMyNotifications, markRead } from "@/controllers/notificationController";

const router = Router();
router.get("/me", requireAuth, listMyNotifications);
router.patch("/:id/read", requireAuth, markRead);

export default router;
