import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/middleware/errorHandler";

const badgeSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const listBadges = asyncHandler(async (_req: Request, res: Response) => {
  const badges = await prisma.badge.findMany();
  res.json(badges);
});

export const createBadge = asyncHandler(async (req: Request, res: Response) => {
  const input = badgeSchema.parse(req.body);
  const badge = await prisma.badge.create({ data: input });
  res.status(201).json(badge);
});

const awardBadgeSchema = z.object({
  playerId: z.string(),
  badgeId: z.string(),
});

export const awardBadge = asyncHandler(async (req: Request, res: Response) => {
  const { playerId, badgeId } = awardBadgeSchema.parse(req.body);
  const existing = await prisma.playerBadge.findUnique({
    where: { playerId_badgeId: { playerId, badgeId } },
  });
  if (existing) throw new ApiError(409, "Badge already awarded to this player");

  const playerBadge = await prisma.playerBadge.create({
    data: { playerId, badgeId },
    include: { badge: true, player: true },
  });
  res.status(201).json(playerBadge);
});

export const listPlayerBadges = asyncHandler(async (req: Request, res: Response) => {
  const badges = await prisma.playerBadge.findMany({
    where: { playerId: req.params.playerId },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });
  res.json(badges);
});
