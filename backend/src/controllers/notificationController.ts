import { Request, Response } from "express";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";

export const listMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(notifications);
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  res.json(notification);
});
