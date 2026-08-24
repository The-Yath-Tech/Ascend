import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { awardXP } from "@/services/xpService";

const awardSchema = z.object({
  playerId: z.string(),
  points: z.number().int(),
  reason: z.string().min(2),
});

export const award = asyncHandler(async (req: Request, res: Response) => {
  const { playerId, points, reason } = awardSchema.parse(req.body);
  const result = await awardXP(playerId, points, reason, "coach");
  res.status(201).json(result);
});

export const history = asyncHandler(async (req: Request, res: Response) => {
  const logs = await prisma.xPLog.findMany({
    where: { playerId: req.params.playerId },
    orderBy: { createdAt: "desc" },
  });
  res.json(logs);
});

export const leaderboard = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.query;
  const players = await prisma.player.findMany({
    where: teamId ? { teamId: String(teamId) } : undefined,
    orderBy: { overallXP: "desc" },
    take: 20,
    select: { id: true, name: true, overallXP: true, level: true, photoUrl: true },
  });
  res.json(players);
});
